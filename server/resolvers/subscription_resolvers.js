const pgclient = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
} = require('./common')

module.exports = {
    Query: {

        fetch_tickets_for_subscription_id: async (parent, args) => {

            console.log(args)

            let result = await pgclient.query("SELECT DISTINCT ON (subscription_ticket.id)  subscription_ticket.id as id, expire_time, canceled_time, A.created as created_date, B.created as destroyed_date, get_ticket_consumed_time(cancel_type, canceled_time, lesson.created) as consumed_date from pilates.subscription_ticket  LEFT JOIN pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id LEFT JOIN (select id, created from pilates.subscription) as A on subscription_ticket.creator_subscription_id = A.id LEFT JOIN (select id, created from pilates.subscription) as B on subscription_ticket.destroyer_subscription_id = B.id WHERE creator_subscription_id=$1 order by id , canceled_time desc nulls first", [args.subscription_id]).then(res => {
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

            return result

        },

        query_all_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {



            let result = await pgclient.query("select \
            json_build_object(\
            'subscription_id',creator_subscription_id,\
            'total_rounds',count(id),\
            'remain_rounds',count(case when get_ticket_consumed_time(cancel_type, canceled_time, lesson_created) is null then 1 else null end),\
            'activity_type',activity_type,\
            'grouping_type',grouping_type,\
            'created',created\
            )\
             from\
            (select distinct on (subscription_ticket.id) \
            subscription_ticket.id as id,\
            subscription_ticket.creator_subscription_id,\
            subscription.activity_type as activity_type,\
            grouping_type,\
            subscription.created as created,\
            lesson.cancel_type as cancel_type,\
            lesson.canceled_time as canceled_time,\
            lesson.created as lesson_created\
            from pilates.subscription_ticket\
            left join pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id\
            left join pilates.subscription on creator_subscription_id = subscription.id \
            where subscription_ticket.creator_subscription_id in (select id from pilates.subscription where clientid=$1)\
            order by subscription_ticket.id, lesson.created desc) AS a\
            group by creator_subscription_id, activity_type, grouping_type, created \
            order by created", [args.clientid]).then(res => {

                // console.log(res.rows)

                let json_arr = res.rows.map(d => d.json_build_object)
                // console.log(json_arr)
                return {
                    success: true,
                    allSubscriptionsWithRemainRounds: json_arr
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


            let subscriptions = await pgclient.query('select plan.id, plan.clientid, client.name as clientname, rounds, totalcost, plan.created, plan.activity_type, plan.grouping_type, plan.coupon_backed from plan left join client on plan.clientid=client.id where client.id=$1', [args.clientid])
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



            let result = await pgclient.query("WITH B AS (select plan.id as planid, plan.clientid, client.name as clientname, client.phonenumber as clientphonenumber, count(1)::int as total_ticket_count,  count( (ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null)) OR NULL )::int as avail_ticket_count, \
            array_agg(ticket.id) filter (where ticket.expire_time > now() AND  ( (A.canceled_time is not NULL AND A.id is not NULL) OR A.id is null)) as avail_ticket_id_list \
             from plan  \
            left join client on plan.clientid = client.id  \
            left join ticket on plan.id = ticket.creator_plan_id \
            left join (select distinct on(ticketid) * from assign_ticket order by ticketid, assign_ticket.created desc) AS A on A.ticketid = ticket.id \
            where clientid = $1 \
            and activity_type = $2 \
            and grouping_type = $3 \
            group by plan.id, plan.clientid, client.name, client.phonenumber \
) \
select * from B where avail_ticket_count >0", [args.clientid, args.activity_type, args.grouping_type]).then(res => {

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
            console.log(args)

            if (args.rounds <= 0) {
                return {
                    success: false
                }
            }

            let result = await pgclient.query('select create_plan_and_tickets($1, $2 , $3, $4, $5, $6)', [args.clientid, args.rounds, args.totalcost, args.activity_type, args.grouping_type, args.coupon_backed == "" ? null : args.coupon_backed]).then(res => {

                console.log(res)
                if (res.rowCount < 1) {
                    return {
                        success: false,
                        msg: 'no rows returned'
                    }
                }

                if (res.rows[0].create_plan_and_tickets === true) {
                    return {
                        success: true
                    }
                }
                else {
                    return {
                        success: false,
                        msg: 'function failed'
                    }
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
        delete_subscription: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query('delete from plan where id=$1', [args.id]).then(res => {
                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => {
                console.log(e)
                return false
            })


            return {
                success: ret
            }
        },
        transfer_tickets_to_clientid: async (parent, args) => {
            console.log('transfer_tickets_to_clientid')

            console.log(args)

            let ret = await pgclient.query('select pilates.transfer_tickets($1, $2)', [args.ticket_id_list, args.clientid]).then(res => {
                console.log(res)

                if (res.rows[0].transfer_tickets) {
                    return {
                        success: true
                    }
                }

                return {
                    success: false,
                    msg: 'query properly done. but result of query was bad.'
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

        }
    }

}