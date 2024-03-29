
const { pool } = require('../pgclient')
const {
    parse_incoming_date_utc_string, ensure_admin_account_id_in_context
} = require('./common')

module.exports = {
    Query: {

        fetch_normal_plan_detail_info: async (parent, args, context) => {

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }


            try {


                if (!ensure_admin_account_id_in_context(context)) {
                    return {
                        success: false,
                        msg: 'invalid token'
                    }
                }

                const planid = args.planid

                // first get tickets 
                let result = await pgclient.query(`select case when A.id is null then null
                when A.canceled_time is not null then null
                else lesson.starttime end
                as consumed_time,
                ticket.id,
                ticket.expire_time,
                ticket.cost
                from ticket
                left join (select distinct on(ticketid) id, ticketid, lessonid, canceled_time  from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id
                left join lesson on lesson.id = A.lessonid
                where ticket.creator_plan_id = $1`, [planid])


                // calculate total cost
                let totalcost = 0

                for (let i = 0; i < result.rows.length; i++) {
                    totalcost += result.rows[i].cost
                }

                const tickets = result.rows

                // gather plan info

                result = await pgclient.query(`select plan.id, client.id as clientid, person.name as clientname, person.phonenumber as clientphonenumber,
                A.types, plan.created
                from plan
                left join (select planid, array_agg(json_build_object('activity_type', activity_type, 'grouping_type', grouping_type)) as types from plan_type group by planid)
                as A on A.planid = plan.id
                left join client on plan.clientid = client.id
                left join person on person.id = client.personid
                where plan.id = $1`, [planid])

                const plan_info = result.rows[0]

                const _result = plan_info
                _result.totalcost = totalcost
                _result.tickets = tickets

                pgclient.release()

                return {
                    success: true,
                    planinfo: _result
                }




            } catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },

        fetch_ticket_available_plan_for_clientid_and_lessontypes: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {


                const clientid = args.clientid
                const activity_type = args.activity_type
                const grouping_type = args.grouping_type
                const excluded_ticket_id_arr = args.excluded_ticket_id_arr


                await pgclient.query('BEGIN')

                let result = await pgclient.query(`select plan.id as planid, array_agg(json_build_object('id', ticket.id, 'expire_time', ticket.expire_time)) as tickets from ticket
                left join plan on ticket.creator_plan_id = plan.id
                left join plan_type on plan.id = plan_type.planid
                left join (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id
                left join lesson on A.lessonid = lesson.id
                where plan_type.activity_type = $1 and plan_type.grouping_type = $2
                and plan.clientid =$3
                and ( (A.id is null) or ((A.id is not null) and (A.canceled_time is not null)) )
                
                group by plan.id
                `, [activity_type, grouping_type, clientid])

                const avail_plan_and_tickets = result.rows



                // gather plan's info
                for (let i = 0; i < avail_plan_and_tickets.length; i++) {
                    const planid = avail_plan_and_tickets[i].planid

                    result = await pgclient.query(`select count(1) as totalcount from ticket where creator_plan_id=$1`, [planid])

                    avail_plan_and_tickets[i].plan_total_rounds = result.rows[0].totalcount
                }


                await pgclient.query(`commit`)
                pgclient.release()

                return {
                    success: true,
                    plans: avail_plan_and_tickets
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    pgclient.release()
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

        query_subscription_info_with_ticket_info: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
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
                    
                    select plan.id, plan.clientid, (array_agg(person.name))[1] as clientname, rounds, totalcost, plan.created, 
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
                    left join person on person.id = client.personid
                    where plan.id = $1
                    group by plan.id`, [args.id])

                pgclient.release()
                return {
                    success: true,
                    subscription_info: result.rows[0]
                }
            }
            catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }


            // let result = await pgclient.query(`with A as (select ticket.id as id, plan.created as created_date, ticket.expire_time ,
            //         plan.id as planid,
            //         CASE
            //         WHEN A.id is null THEN null
            //         WHEN A.id is not null AND A.canceled_time is not null THEN null
            //         WHEN lesson.canceled_time is not null THEN null
            //         ELSE lesson.starttime
            //         END as consumed_date,
            //         C.created as destroyed_date
            //         from plan
            //         left join ticket on ticket.creator_plan_id = plan.id
            //         left join (select id, created from plan) as C on C.id = ticket.destroyer_plan_id
            //         left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) as A on A.ticketid = ticket.id
            //         left join lesson on lesson.id = A.lessonid
            //         where plan.id = $1 AND ticket.id is not null)

            //         select plan.id, plan.clientid, (array_agg(person.name))[1] as clientname, rounds, totalcost, plan.created, 
            //         plan.activity_type, plan.grouping_type, plan.coupon_backed ,
            //         json_agg(json_build_object('id',A.id,
            //                         'created_date', A.created_date,
            //                         'expire_time', A.expire_time,
            //                         'consumed_date', A.consumed_date,
            //                         'destroyed_date', A.destroyed_date
            //                         )) as tickets
            //         from plan
            //         left join client on plan.clientid=client.id 
            //         left join A on A.planid = plan.id
            //         left join person on person.id = client.personid
            //         where plan.id = $1
            //         group by plan.id`, [args.id]).then(res => {
            //     if (res.rowCount === 1) {
            //         return {
            //             success: true,
            //             subscription_info: res.rows[0]

            //         }

            //     }
            //     else {
            //         return {
            //             success: false,
            //             msg: 'row count not 1'
            //         }
            //     }
            // }).catch(e => {
            //     console.log(e)


            //     return {
            //         success: false,
            //         msg: 'query error'
            //     }
            // })

            // console.log(result)

            // return result
        },

        fetch_tickets_for_subscription_id: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }


            try {

                const planid = args.subscription_id

                let result = await pgclient.query(`select ticket.id as id, ticket.expire_time as expire_time,
                case when A.id is null then null
                when (A.canceled_time is not null) then null
                when (A.canceled_time is null) and (A.id is not null) and (lesson.canceled_time is null) then lesson.starttime
                else null end
                as consumed_date,
                ticket.cost as cost,
                B.created as destroyed_date,
                C.created as created_date
                from ticket
                left join (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id
                left join lesson on A.lessonid = lesson.id
                left join plan as B on ticket.destroyer_plan_id = B.id
                left join plan as C on ticket.creator_plan_id = C.id
                where ticket.creator_plan_id=$1`, [planid])

                pgclient.release()

                return {
                    success: true,
                    tickets: result.rows
                }



            }
            catch (e) {
                console.log(e)
                pgclient.release()
                return {
                    success: false,
                    msg: e.detail
                }
            }


        },

        query_all_subscriptions_with_remainrounds_for_clientid: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {

                let result = await pgclient.query(`select array_agg(json_build_object('id',ticket.id, 'expire_time',ticket.expire_time, 'consumed', case when A.id is null then false
                when A.canceled_time is not null then false
                else true end )) as tickets,
                plan.id as planid,
                plan.created as created
                from ticket
                left join plan on ticket.creator_plan_id = plan.id
                left join (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id
                where plan.clientid=$1
                group by plan.id`, [args.clientid])

                const plan_arr = []

                for (let i = 0; i < result.rows.length; i++) {
                    const a = result.rows[i]

                    const planid = a.planid
                    const tickets = a.tickets

                    const totalcount = tickets.length
                    let consumed_count = 0

                    for (let j = 0; j < tickets.length; j++) {
                        if (tickets[j].consumed) {
                            consumed_count += 1
                        }
                    }

                    const remaincount = totalcount - consumed_count


                    let result2 = await pgclient.query(`select activity_type, grouping_type from plan_type
                    where planid=$1`, [planid])


                    plan_arr.push({
                        planid: planid,
                        total_rounds: totalcount,
                        remain_rounds: remaincount,
                        created: a.created,
                        plan_types: result2.rows
                    })


                }

                pgclient.release()

                return {
                    success: true,
                    allSubscriptionsWithRemainRounds: plan_arr
                }

            } catch (e) {
                console.log(e)
                pgclient.release()
                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        query_subscriptions_by_clientid: async (parent, args, context) => {

            console.log('query_subscriptions_by_clientid')
            console.log(args)


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {

                let result = await pgclient.query(`select plan.id, plan.created, client.id as clientid, person.name as clientname, person.phonenumber as clientphonenumber, A.types, B.rounds, B.totalcost, plan.coupon_backed from plan
                left join client on client.id = plan.clientid
                left join person on person.id = client.personid
                left join (select array_agg(json_build_object('activity_type',activity_type, 'grouping_type',grouping_type)) as types , planid from plan_type group by planid) as A on A.planid = plan.id
                left join (select count(1) as rounds, sum(cost) as totalcost, creator_plan_id from ticket group by creator_plan_id) as B on B.creator_plan_id = plan.id
                where client.id = $1
                `, [args.clientid])

                console.log(result)

                pgclient.release()

                return {
                    success: true,
                    subscriptions: result.rows
                }

            } catch (e) {
                console.log(e)
                pgclient.release()
                return {
                    success: false,
                    msg: e.detail
                }
            }



        },

        query_subscriptions_of_clientname: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                let result = await pgclient.query(`select plan.id, plan.clientid, person.name as clientname, rounds, totalcost, plan.created, plan.activity_type, plan.grouping_type, plan.coupon_backed from plan 
                left join client on plan.clientid=client.id 
                left join person on person.id = client.personid
                where person.name=$1`, [args.clientname])

                pgclient.release()

                return {
                    success: true,
                    subscriptions: result.rows
                }
            } catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false
                }
            }

            // let subscriptions = await pgclient.query(`select plan.id, plan.clientid, person.name as clientname, rounds, totalcost, plan.created, plan.activity_type, plan.grouping_type, plan.coupon_backed from plan 
            // left join client on plan.clientid=client.id 
            // left join person on person.id = client.personid
            // where client.name=$1`, [args.clientname])
            //     .then(res => {
            //         console.log(res.rows)
            //         return res.rows
            //     }).catch(e => {
            //         console.log(e)
            //         return null
            //     })


            // if (subscriptions == null) {
            //     return {
            //         success: false,
            //         subscriptions: []
            //     }
            // }
            // else {

            //     return {
            //         success: true,
            //         subscriptions: subscriptions
            //     }
            // }



        },

        query_subscriptions: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                let result = await pgclient.query(`select subscription.id, subscription.clientid, person.name as clientname, rounds, totalcost, subscription.created, subscription.activity_type, subscription.grouping_type, subscription.coupon_backed from pilates.subscription 
                left join pilates.client on subscription.clientid=client.id
                left join person on person.id = client.personid
                `)
                pgclient.release()
                return {
                    success: true,
                    subscriptions: result.rows

                }
            } catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false
                }
            }

            // let subscriptions = await pgclient.query(`select subscription.id, subscription.clientid, person.name as clientname, rounds, totalcost, subscription.created, subscription.activity_type, subscription.grouping_type, subscription.coupon_backed from pilates.subscription 
            // left join pilates.client on subscription.clientid=client.id
            // left join person on person.id = client.personid
            // `).then(res => {
            //     return res.rows
            // }).catch(e => {
            //     console.log(e)
            //     return null
            // })


            // if (subscriptions == null) {
            //     return {
            //         success: true,
            //         subscriptions: []
            //     }
            // }
            // else {

            //     return {
            //         success: true,
            //         "subscriptions": subscriptions
            //     }
            // }

        },
        query_subscriptions_with_remainrounds_for_clientid: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                let result = await pgclient.query(`WITH B AS (select plan.id as planid,
                    plan.clientid, person.name as clientname, 
                    person.phonenumber as clientphonenumber, 
                    count(1)::int as total_ticket_count,  
                    count(1) filter(where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null)  as avail_ticket_count, 
                    array_agg(ticket.id) filter (where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null) as avail_ticket_id_list 
                                 from plan  
                                left join client on plan.clientid = client.id  
                                left join person on person.id = client.personid
                                left join ticket on plan.id = ticket.creator_plan_id 
                                left join (select distinct on(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) AS A on A.ticketid = ticket.id 
                                where clientid = $1 
                                and activity_type = $2 
                                and grouping_type = $3 
                                group by plan.id, plan.clientid, person.name, person.phonenumber 
                    ) 
                    select * from B where avail_ticket_count >0`, [args.clientid, args.activity_type, args.grouping_type])

                pgclient.release()
                return {
                    success: true,
                    planandtickets: result.rows
                }
            } catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }

            // let result = await pgclient.query(`WITH B AS (select plan.id as planid,
            //     plan.clientid, person.name as clientname, 
            //     person.phonenumber as clientphonenumber, 
            //     count(1)::int as total_ticket_count,  
            //     count(1) filter(where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null)  as avail_ticket_count, 
            //     array_agg(ticket.id) filter (where  ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null) AND ticket.destroyer_plan_id is null) as avail_ticket_id_list 
            //                  from plan  
            //                 left join client on plan.clientid = client.id  
            //                 left join person on person.id = client.personid
            //                 left join ticket on plan.id = ticket.creator_plan_id 
            //                 left join (select distinct on(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) AS A on A.ticketid = ticket.id 
            //                 where clientid = $1 
            //                 and activity_type = $2 
            //                 and grouping_type = $3 
            //                 group by plan.id, plan.clientid, person.name, person.phonenumber 
            //     ) 
            //     select * from B where avail_ticket_count >0`, [args.clientid, args.activity_type, args.grouping_type]).then(res => {


            //     return {
            //         success: true,
            //         planandtickets: res.rows
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
    },
    Mutation: {
        update_normal_plan_basicinfo: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {


                await pgclient.query('commit')

                // update totalcost
                // check current totalcost
                let result = await pgclient.query(`select sum(cost) as totalcost, count(1) as count from ticket where creator_plan_id=$1`, [args.planid])

                if (result.rows[0].totalcost !== args.totalcost) {
                    // update cost of each tickets
                    const new_perticket_cost = Math.ceil(args.totalcost / result.rows[0].count)

                    result = await pgclient.query(`select id from ticket where creator_plan_id = $1`, [args.planid])

                    for (let i = 0; i < result.rows.length; i++) {
                        const a = result.rows[i].id

                        await pgclient.query(`update ticket set cost=$1 where id=$2`, [new_perticket_cost, a])
                    }


                }

                // update client

                result = await pgclient.query(`select clientid from plan where id=$1`, [args.planid])

                if (result.rows[0].clientid !== args.clientid) {
                    await pgclient.query(`update plan set clientid=$1 where id=$2`, [args.clientid, args.planid])
                }



                // update types

                // first fetch existing types
                result = await pgclient.query(`select id, activity_type, grouping_type from plan_type where planid=$1`, [args.planid])

                // split to exiting id that needs to be removed
                // and new types to be added


                const existing_types = result.rows

                const to_remove_id_arr = []
                const to_add_types = []

                // gather types to add
                for (let i = 0; i < args.types.length; i++) {
                    const p = args.types[i]

                    let match_with_exist = false

                    for (let j = 0; j < existing_types.length; j++) {
                        const a = existing_types[j]

                        if (p.activity_type === a.activity_type && p.grouping_type === a.grouping_type) {
                            match_with_exist = true
                            break

                        }
                    }

                    if (!match_with_exist) {
                        to_add_types.push(p)
                    }


                }

                // gather from existing to remove
                for (let i = 0; i < existing_types.length; i++) {
                    const p = existing_types[i]

                    let match_found = false

                    for (let j = 0; j < args.types.length; j++) {
                        const a = args.types[j]

                        if (p.activity_type === a.activity_type && p.grouping_type === a.grouping_type) {
                            match_found = true
                            break
                        }

                    }

                    if (!match_found) {
                        to_remove_id_arr.push(p.id)
                    }
                }


                // execute removal
                for (let i = 0; i < to_remove_id_arr.length; i++) {
                    await pgclient.query(`delete from plan_type where id=$1`, [to_remove_id_arr[i]])
                }

                // execute adding
                for (let i = 0; i < to_add_types.length; i++) {
                    const a = to_add_types[i]

                    await pgclient.query(`insert into plan_type (planid, activity_type, grouping_type) values ($1,$2,$3)`, [args.planid, a.activity_type, a.grouping_type])
                }


                await pgclient.query(`commit`)
                pgclient.release()

                return {
                    success: true
                }




            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                    pgclient.release()

                } catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },
        update_normal_plan_types: async (parent, args, context) => {

            console.log('update_normal_plan_types')
            console.log(args)


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {


                // update types

                // first fetch existing types
                result = await pgclient.query(`select id, activity_type, grouping_type from plan_type where planid=$1`, [args.planid])

                // split to exiting id that needs to be removed
                // and new types to be added


                const existing_types = result.rows

                const to_remove_id_arr = []
                const to_add_types = []

                // gather types to add
                for (let i = 0; i < args.types.length; i++) {
                    const p = args.types[i]

                    let match_with_exist = false

                    for (let j = 0; j < existing_types.length; j++) {
                        const a = existing_types[j]

                        if (p.activity_type === a.activity_type && p.grouping_type === a.grouping_type) {
                            match_with_exist = true
                            break

                        }
                    }

                    if (!match_with_exist) {
                        to_add_types.push(p)
                    }


                }

                // gather from existing to remove
                for (let i = 0; i < existing_types.length; i++) {
                    const p = existing_types[i]

                    let match_found = false

                    for (let j = 0; j < args.types.length; j++) {
                        const a = args.types[j]

                        if (p.activity_type === a.activity_type && p.grouping_type === a.grouping_type) {
                            match_found = true
                            break
                        }

                    }

                    if (!match_found) {
                        to_remove_id_arr.push(p.id)
                    }
                }


                // execute removal
                for (let i = 0; i < to_remove_id_arr.length; i++) {
                    await pgclient.query(`delete from plan_type where id=$1`, [to_remove_id_arr[i]])
                }

                // execute adding
                for (let i = 0; i < to_add_types.length; i++) {
                    const a = to_add_types[i]

                    await pgclient.query(`insert into plan_type (planid, activity_type, grouping_type) values ($1,$2,$3)`, [args.planid, a.activity_type, a.grouping_type])
                }


                await pgclient.query(`commit`)
                pgclient.release()

                return {
                    success: true
                }


            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                    pgclient.release()

                }
                catch { }


                return {
                    success: false,
                    msg: e.detail
                }

            }



        },
        create_subscription: async (parent, args, context) => {

            console.log('create_subscription')
            console.log(args)


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


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
            const percost = Math.floor(args.totalcost / args.rounds)
            let remain = args.totalcost - (percost * args.rounds) 



            if (percost <= 0) {
                return {
                    success: false,
                    msg: 'percost is <=0'
                }
            }


            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
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
                    let cost = percost
                    if(remain>0){
                        cost++
                        remain--
                    }

                    await pgclient.query(`insert into ticket (expire_time, creator_plan_id, cost) values ($1, $2, $3)`, [args.expiredate, created_plan_id, cost])
                }


                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    pgclient.release()
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
        delete_subscription: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {

                await pgclient.query('begin')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                // check plan id exists
                result = await pgclient.query(`select id from plan where id=$1`, [args.id])

                if (result.rows.length !== 1) {
                    throw {
                        detail: 'no plan with id exists'
                    }
                }

                // gather tickets and check they are not consumed
                result = await pgclient.query(`select ticket.id, case when A.id is null then false
                when A.id is not null AND A.canceled_time is not null then false
                else true end
                as consumed
                from ticket
                left join (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id
                where creator_plan_id=$1`, [args.id])

                // if all tickets are not consumed, then allow delete

                let check = true
                const ticket_id_arr = []

                for (let i = 0; i < result.rows.length; i++) {
                    ticket_id_arr.push(result.rows[i].id)
                    if (result.rows[i].consumed === true) {
                        check = false
                        break
                    }
                }

                if (!check) {
                    throw {
                        detail: 'at least one ticket is consumed'
                    }
                }

                // delete tickets

                for (let i = 0; i < ticket_id_arr.length; i++) {
                    const a = ticket_id_arr[i]
                    await pgclient.query(`delete from ticket where id=$1`, [a])

                }

                // delete plan
                await pgclient.query(`delete from plan where id=$1`, [args.id])


                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }

            // let result = await pgclient.query('BEGIN').then(async res => {

            //     return await pgclient.query(`select count(1) filter(where B.canceled_time is null AND B.created is not null)::int as undelete_count from plan
            //     left join ticket on ticket.creator_plan_id = plan.id
            //     left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, created desc) as B 
            //     on B.ticketid = ticket.id
            //     where plan.id = $1;`, [args.id]).then(async res => {

            //         let undelete_count = res.rows[0].undelete_count

            //         console.log(undelete_count)

            //         if (undelete_count > 0) {
            //             return {
            //                 success: false,
            //                 msg: 'undeletable ticket exist'
            //             }
            //         }

            //         // delete assign tickets that are cancelled

            //         return await pgclient.query(`delete from plan where plan.id=$1`, [args.id]).then(async res => {
            //             return await pgclient.query('COMMIT').then(res => {
            //                 return {
            //                     success: true
            //                 }
            //             })
            //         })

            //     })
            // }).catch(async e => {
            //     console.log(e)


            //     return await pgclient.query('rollback').then(res => {

            //         if (e.code === '23503') {
            //             return {
            //                 success: false,
            //                 msg: 'undeletable connected elements exist'
            //             }
            //         }

            //         return {
            //             success: false,
            //             msg: e.detail
            //         }
            //     }).catch(err => {
            //         return {
            //             success: false,
            //             msg: err.detail
            //         }
            //     })

            // })

            // return result

        },
        transfer_tickets_to_clientid: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                await pgclient.query('begin')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                // create new plan with new client
                const ticket_id_arr = args.ticket_id_list
                const recv_clientid = args.clientid

                if (ticket_id_arr.length < 1) {
                    throw {
                        detail: 'no ticket id list given'
                    }
                }

                // fetch plan info of existing tickets
                // simply select the plan types of the first ticket id

                result = await pgclient.query(`select creator_plan_id as id from ticket where id=$1`, [ticket_id_arr[0]])

                const existing_plan_id = result.rows[0].id

                result = await pgclient.query(`select activity_type, grouping_type from plan_type where planid=$1`, [existing_plan_id])

                const existing_plantypes = result.rows

                if (existing_plantypes.length < 1) {
                    throw {
                        detail: 'existing plan has no types'
                    }
                }

                // creat new plan

                result = await pgclient.query(`insert into plan (clientid, created, transferred_from_subscription_id) values ($1, now(), $2) returning id`, [recv_clientid, existing_plan_id])

                const created_plan_id = result.rows[0].id

                // create new plan's types
                for (let i = 0; i < existing_plantypes.length; i++) {
                    const at = existing_plantypes[i].activity_type
                    const gt = existing_plantypes[i].grouping_type
                    await pgclient.query(`insert into plan_type (planid, activity_type, grouping_type) values ($1, $2, $3)`, [created_plan_id, at, gt])
                }

                // transfer tickets
                for (let i = 0; i < ticket_id_arr.length; i++) {
                    await pgclient.query(`update ticket set creator_plan_id=$1 where id = $2`, [created_plan_id, ticket_id_arr[i]])
                }



                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        update_expdate_of_tickets: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let new_expdate = parse_incoming_date_utc_string(args.new_expdate)

            if (args.ticket_id_list.length === 0) {
                return {
                    success: false,
                    msg: 'no ticket ids given'
                }
            }

            let ticket_id_list = args.ticket_id_list.map(a => parseInt(a))

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {

                await pgclient.query('begin')
                let result = await pgclient.query('update ticket set expire_time=to_timestamp($1) where id in (select(unnest(cast($2 as int[]))) )', [new_expdate, ticket_id_list])

                if (result.rowCount === 0) {
                    throw {
                        detail: 'no tickets updated'
                    }
                }


                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                }
                catch { }

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        delete_tickets: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                await pgclient.query('begin')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                for (let i = 0; i < args.ticketid_arr.length; i++) {
                    await pgclient.query('delete from ticket where id=$1', [args.ticketid_arr[i]])
                }

                await pgclient.query(`commit`)
                pgclient.release()

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        add_tickets: async (parent, args, context) => {



            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {

                await pgclient.query('begin')

                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                const per_ticket_cost = args.per_ticket_cost
                const planid = args.planid
                const expdate = args.expire_datetime

                for (let i = 0; i < args.addsize; i++) {

                    await pgclient.query(`insert into ticket (expire_time, creator_plan_id, cost) values ($1, $2, $3)`, [expdate, planid, per_ticket_cost])
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            }
            catch (e) {
                console.log(e)
                try {

                    await pgclient.query(`rollback`)
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }


            }

        },
        change_plan_totalcost: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'pg pool error'
                }
            }

            try {
                let result = await pgclient.query(`update plan set totalcost=$1 where id = $2`, [args.totalcost, args.planid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no plan with id found'
                    }
                }

                pgclient.release()

                return {
                    success: true
                }


            } catch (e) {
                console.log(e)
                pgclient.release()
                return {
                    success: false,
                    msg: e.detail
                }
            }

        }
    }

}