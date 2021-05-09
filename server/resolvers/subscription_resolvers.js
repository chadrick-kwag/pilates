
const pgclient = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
} = require('./common')

module.exports = {
    Query: {

        fetch_ticket_available_plan_for_clientid_and_lessontypes: async (parent, args) => {
            try {

                console.log('fetch_ticket_available_plan_for_clientid_and_lessontypes')
                console.log(args)

                const clientid = args.clientid
                const activity_type = args.activity_type
                const grouping_type = args.grouping_type
                const excluded_ticket_id_arr = args.excluded_ticket_id_arr


                await pgclient.query('BEGIN')

                const result1 = await pgclient.query(`with A as (
                    select * from plan where clientid=$1 and activity_type = $2
                    AND grouping_type = $3
                    )
                    
                    select A.id as planid,array_agg(json_build_object('ticketid', ticket.id, 'expiretime', ticket.expire_time)) as ticket_id_arr from A 
                    left join ticket on ticket.creator_plan_id = A.id
                    left join (select distinct on (ticketid) * from assign_ticket order by ticketid, created desc) as B on B.ticketid = ticket.id
                    left join lesson on lesson.id = B.lessonid
                    where B.created is null OR (B.created is not null AND lesson.canceled_time is not null)
                    group by A.id`, [clientid, activity_type, grouping_type])

                // for each ticket id arr, remove ids included in excluded_ticket_id_arr
                let filtered_plans = []

                const excluded_ticket_id_set = new Set(excluded_ticket_id_arr)
                console.log(result1)
                console.log(result1.rows.length)
                for (let i = 0; i < result1.rows.length; i++) {
                    console.log('start of iteration')
                    console.log(i)
                    const a = result1.rows[i]
                    console.log(a)
                    const planid = a.planid
                    // let ticket_id_arr_set = new Set(a.ticket_id_arr)
                    let ticket_id_arr_set = a.ticket_id_arr

                    console.log('ticket_id_arr_set')
                    console.log(ticket_id_arr_set)

                    let filtered_ticket_obj_arr = [...ticket_id_arr_set].filter(x => !excluded_ticket_id_set.has(x.ticketid))

                    filtered_ticket_obj_arr.sort((p, q) => {
                        const _a = new Date(p.expiretime)
                        const _b = new Date(q.expiretime)

                        console.log(_a)

                        _a < _b
                    })

                    console.log('expiretime sorted filtered_ticket_obj_arr')
                    console.log(filtered_ticket_obj_arr)

                    let filtered_ticket_id_arr = filtered_ticket_obj_arr.map(d => d.ticketid)

                    console.log('filtered_ticket_id_arr')
                    console.log(filtered_ticket_id_arr)

                    if (filtered_ticket_id_arr.length === 0) {
                        continue;
                    }

                    // fetch plan info
                    result = await pgclient.query(`select totalcost::int from plan where id=$1`, [planid])
                    const totalcost = result.rows[0].totalcost

                    console.log('totalcost')
                    console.log(totalcost)

                    result = await pgclient.query(`select count(1)::int as totalcount from ticket where creator_plan_id = $1`, [planid])

                    const total_rounds = result.rows[0].totalcount

                    console.log('total_rounds')
                    console.log(total_rounds)

                    filtered_plans.push({
                        planid: planid,
                        plan_total_rounds: total_rounds,
                        per_ticket_cost: Math.ceil(totalcost / total_rounds),
                        fastest_expiring_ticket_expire_time: filtered_ticket_obj_arr[0].expiretime,
                        ticket_id_arr: filtered_ticket_id_arr
                    })

                    console.log('pushed to filtered_plans ')


                }

                console.log("filtered_plans")
                console.log(filtered_plans)

                await pgclient.query(`end`)

                return {
                    success: true,
                    plans: filtered_plans
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }
        },

        query_subscription_info_with_ticket_info: async (parent, args) => {
            console.log('query_subscription_info_with_ticket_info')
            console.log(args)


            let result = await pgclient.query(`with A as (select ticket.id as id, plan.created as created_date, ticket.expire_time ,
                    plan.id as planid,
                    CASE
                    WHEN A.id is null THEN null
                    WHEN A.id is not null AND A.canceled_time is not null THEN null
                    WHEN lesson.canceled_time is not null THEN null
                    ELSE lesson.starttime
                    END as consumed_date,
                    C.created as destroyed_date
                    from plan
                    left join ticket on ticket.creator_plan_id = plan.id
                    left join (select id, created from plan) as C on C.id = ticket.destroyer_plan_id
                    left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) as A on A.ticketid = ticket.id
                    left join lesson on lesson.id = A.lessonid
                    where plan.id = $1 AND ticket.id is not null)
                    
                    select plan.id, plan.clientid, (array_agg(client.name))[1] as clientname, rounds, totalcost, plan.created, 
                    plan.activity_type, plan.grouping_type, plan.coupon_backed ,
                    json_agg(json_build_object('id',A.id,
                                    'created_date', A.created_date,
                                    'expire_time', A.expire_time,
                                    'consumed_date', A.consumed_date,
                                    'destroyed_date', A.destroyed_date
                                    )) as tickets
                    from plan
                    left join client on plan.clientid=client.id 
                    left join A on A.planid = plan.id
                    where plan.id = $1
                    group by plan.id`, [args.id]).then(res => {
                if (res.rowCount === 1) {
                    return {
                        success: true,
                        subscription_info: res.rows[0]

                    }

                }
                else {
                    return {
                        success: false,
                        msg: 'row count not 1'
                    }
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log(result)

            return result
        },

        fetch_tickets_for_subscription_id: async (parent, args) => {

            console.log(args)

            let result = await pgclient.query(`select ticket.id as id, plan.created as created_date, ticket.expire_time 
            ,
            CASE
            WHEN A.id is null THEN null
            WHEN A.id is not null AND A.canceled_time is not null THEN null
            WHEN lesson.canceled_time is not null THEN null
            ELSE lesson.starttime
            END as consumed_date,
            C.created as destroyed_date
            from plan
            left join ticket on ticket.creator_plan_id = plan.id
            left join (select id, created from plan) as C on C.id = ticket.destroyer_plan_id
            left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) as A on A.ticketid = ticket.id
            left join lesson on lesson.id = A.lessonid
            where plan.id = $1 AND ticket.id is not null`, [args.subscription_id]).then(res => {
                console.log(res.rows)

                return {
                    success: true,
                    tickets: res.rows
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: "query error"
                }
            })

            console.log(result)

            return result

        },

        query_all_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {



            let result = await pgclient.query(`select  plan.id as planid,
            count(1) filter (where ticket.id is not null) as total_rounds,
            count( 1 ) filter (where (A.id is null OR (A.id is not null AND A.canceled_time is not null)) AND ticket.expire_time > now() AND ticket.destroyer_plan_id is null)  as remain_rounds , 
            plan.created,
            plan.activity_type,
            plan.grouping_type
            from plan
            left join ticket on plan.id = ticket.creator_plan_id
            left join (select DISTINCT ON (ticketid) * from assign_ticket order by ticketid, created desc) AS A on A.ticketid = ticket.id
            where plan.clientid = $1
            
            group by plan.id
            `, [args.clientid]).then(res => {

                console.log(res)

                return {
                    success: true,
                    allSubscriptionsWithRemainRounds: res.rows
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log(result)

            return result
        },
        query_subscriptions_by_clientid: async (parent, args) => {
            console.log('inside query_subscriptions_by_clientid')
            console.log(args)

            try{

                let result = await pgclient.query(`select plan.id, plan.created, client.id as clientid, client.name as clientname, client.phonenumber as clientphonenumber, A.types, B.rounds, B.totalcost, plan.coupon_backed from plan
                left join client on client.id = plan.clientid
                left join (select array_agg(json_build_object('activity_type',activity_type, 'grouping_type',grouping_type)) as types , planid from plan_type group by planid) as A on A.planid = plan.id
                left join (select count(1) as rounds, sum(cost) as totalcost, creator_plan_id from ticket group by creator_plan_id) as B on B.creator_plan_id = plan.id
                where client.id = $1
                `,[args.clientid])

                console.log(result)


                return {
                    success: true,
                    subscriptions: result.rows
                }



            }catch(e){
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            }



        },

        query_subscriptions_of_clientname: async (parent, args) => {

            console.log('inside query_subscriptions_of_clientname')
            console.log(args)

            let subscriptions = await pgclient.query('select plan.id, plan.clientid, client.name as clientname, rounds, totalcost, plan.created, plan.activity_type, plan.grouping_type, plan.coupon_backed from plan left join client on plan.clientid=client.id where client.name=$1', [args.clientname])
                .then(res => {
                    console.log(res.rows)
                    return res.rows
                }).catch(e => {
                    console.log(e)
                    return null
                })


            if (subscriptions == null) {
                return {
                    success: false,
                    subscriptions: []
                }
            }
            else {

                let retobj = {
                    success: true,
                    subscriptions: subscriptions
                }
                console.log(retobj)
                return retobj
            }



        },

        query_subscriptions: async (parent, args) => {
            console.log(args)

            let subscriptions = await pgclient.query("select subscription.id, subscription.clientid, client.name as clientname, rounds, totalcost, subscription.created, subscription.activity_type, subscription.grouping_type, subscription.coupon_backed from pilates.subscription left join pilates.client on subscription.clientid=client.id").then(res => {
                console.log(res.rows)
                return res.rows
            }).catch(e => {
                console.log(e)
                return null
            })

            console.log(subscriptions)

            if (subscriptions == null) {
                return {
                    success: false,
                    subscriptions: []
                }
            }
            else {

                let retobj = {
                    success: true,
                    "subscriptions": subscriptions
                }
                console.log(retobj)
                return retobj
            }

        },
        query_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {
            console.log(args)



            let result = await pgclient.query(`WITH B AS (select plan.id as planid,
                plan.clientid, client.name as clientname, 
                client.phonenumber as clientphonenumber, 
                count(1)::int as total_ticket_count,  
                count(1) filter(where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null)  as avail_ticket_count, 
                array_agg(ticket.id) filter (where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null) as avail_ticket_id_list 
                             from plan  
                            left join client on plan.clientid = client.id  
                            left join ticket on plan.id = ticket.creator_plan_id 
                            left join (select distinct on(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) AS A on A.ticketid = ticket.id 
                            where clientid = $1 
                            and activity_type = $2 
                            and grouping_type = $3 
                            group by plan.id, plan.clientid, client.name, client.phonenumber 
                ) 
                select * from B where avail_ticket_count >0`, [args.clientid, args.activity_type, args.grouping_type]).then(res => {

                console.log(res)

                return {
                    success: true,
                    planandtickets: res.rows
                }

            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            return result
        },
    },
    Mutation: {
        create_subscription: async (parent, args) => {
            console.log('create_subscrition')
            console.log(args)


            // check args
            if (args.activity_type_arr.length === 0) {
                return {
                    success: false,
                    msg: 'no activity type'
                }
            }

            if (args.grouping_type === null || args.grouping_type === '') {
                return {
                    success: false,
                    msg: 'no grouping type'
                }
            }


            if (args.rounds <= 0) {
                return {
                    success: false,
                    msg: 'rounds must be > 0'
                }
            }

            // calculate percost first.
            const percost = Math.ceil(args.totalcost / args.rounds)

            if (percost <= 0) {
                return {
                    success: false,
                    msg: 'percost is <=0'
                }
            }

            try {

                await pgclient.query(`begin`)

                // first create plan

                let result = await pgclient.query(`insert into plan (clientid, created, coupon_backed) values ($1, now(), $2) returning id`, [args.clientid, args.coupon_backed])

                const created_plan_id = result.rows[0].id



                // create plan type

                for (let i = 0; i < args.activity_type_arr.length; i++) {
                    const at = args.activity_type_arr[i]
                    const gt = args.grouping_type

                    await pgclient.query(`insert into plan_type (planid, activity_type, grouping_type) values ($1, $2, $3)`, [created_plan_id, at, gt])
                }



                // create tickets
                for (let i = 0; i < args.rounds; i++) {
                    await pgclient.query(`insert into ticket (expire_time, creator_plan_id, cost) values ($1, $2, $3)`, [args.expiredate, created_plan_id, percost])
                }


                await pgclient.query('commit')

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }


            // console.log(args)

            // if (args.rounds <= 0) {
            //     return {
            //         success: false
            //     }
            // }

            // let expire_date = new Date(args.expiredate)

            // let _args = [args.clientid, args.rounds, args.totalcost, args.activity_type, args.grouping_type, args.coupon_backed == "" ? null : args.coupon_backed, expire_date]

            // console.log(_args)

            // let result = await pgclient.query('select * from create_plan_and_tickets($1, $2 , $3, $4, $5, $6, $7) as (success bool, msg text)', _args).then(res => {

            //     console.log(res)
            //     if (res.rowCount !== 1) {
            //         return {
            //             success: false,
            //             msg: 'row count not 1'
            //         }
            //     }
            //     else {
            //         return res.rows[0]
            //     }

            // }).catch(e => {
            //     console.log(e)
            //     return {
            //         success: false,
            //         msg: 'query error'
            //     }
            // })

            // return result

        },
        delete_subscription: async (parent, args) => {
            console.log('delete subscription')
            console.log(args)

            let result = await pgclient.query('BEGIN').then(async res => {

                return await pgclient.query(`select count(1) filter(where B.canceled_time is null AND B.created is not null)::int as undelete_count from plan
                left join ticket on ticket.creator_plan_id = plan.id
                left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, created desc) as B 
                on B.ticketid = ticket.id
                where plan.id = $1;`, [args.id]).then(async res => {

                    let undelete_count = res.rows[0].undelete_count

                    console.log(undelete_count)

                    if (undelete_count > 0) {
                        return {
                            success: false,
                            msg: 'undeletable ticket exist'
                        }
                    }

                    // delete assign tickets that are cancelled

                    return await pgclient.query(`delete from plan where plan.id=$1`, [args.id]).then(async res => {
                        return await pgclient.query('COMMIT').then(res => {
                            return {
                                success: true
                            }
                        })
                    })

                })
            }).catch(async e => {
                console.log(e)


                return await pgclient.query('rollback').then(res => {

                    if (e.code === '23503') {
                        return {
                            success: false,
                            msg: 'undeletable connected elements exist'
                        }
                    }

                    return {
                        success: false,
                        msg: e.detail
                    }
                }).catch(err => {
                    return {
                        success: false,
                        msg: err.detail
                    }
                })

            })

            return result

        },
        transfer_tickets_to_clientid: async (parent, args) => {
            console.log('transfer_tickets_to_clientid')

            console.log(args)

            let ret = await pgclient.query('select * from transfer_tickets($1, $2) as (success bool, msg text)', [args.ticket_id_list, args.clientid]).then(res => {
                console.log(res)

                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: 'row count not 1'
                    }
                }
                else {
                    return res.rows[0]
                }
            }).catch(e => {
                // console.log(e)
                console.log(e.error)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            return ret
        },
        update_expdate_of_tickets: async (parent, args) => {

            let new_expdate = parse_incoming_date_utc_string(args.new_expdate)
            if (args.ticket_id_list.length === 0) {
                return {
                    success: false,
                    msg: 'no ticket ids given'
                }
            }

            let ticket_id_list = args.ticket_id_list.map(a => parseInt(a))

            let ret = await pgclient.query('update ticket set expire_time=to_timestamp($1) where id in (select(unnest(cast($2 as int[]))) )', [new_expdate, ticket_id_list]).then(res => {

                if (res.rowCount > 0) {
                    return {
                        success: true
                    }
                }
                else {
                    return {
                        success: false,
                        msg: 'rowcount =0'
                    }
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            return ret

        },
        delete_tickets: async (parent, args) => {
            console.log('delete_tickets')

            console.log(args)

            let result = await pgclient.query(`select * from delete_tickets($1) as (success bool, msg text)`, [args.ticketid_arr]).then(res => {
                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: 'rowcount not 1'
                    }
                }

                return res.rows[0]
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result

        },
        add_tickets: async (parent, args) => {
            console.log('add tickets')
            console.log(args)

            let result = await pgclient.query(`select * from add_tickets($1, $2,$3) as (success bool, msg text)`, [args.planid, args.addsize, args.expire_datetime]).then(res => {
                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: 'rowcount not one'
                    }
                }
                else {
                    return res.rows[0]
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            return result
        },
        change_plan_totalcost: async (parent, args) => {
            let result = await pgclient.query(`update plan set totalcost=$1 where id = $2`, [args.totalcost, args.planid]).then(res => {
                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: "rowcount not 1"
                    }
                }
                else {
                    return {
                        success: true
                    }
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        }
    }

}