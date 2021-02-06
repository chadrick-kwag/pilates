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

            /* old query: select subscription_ticket.id, expire_time, subscription.created as created_date, \
            lesson.created as consumed_date ,\
            destroyer_subscription.created as destroyed_date\
            from pilates.subscription_ticket \
            left join pilates.subscription on subscription_ticket.creator_subscription_id = subscription.id \
            left join pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id \
            left join pilates.subscription as destroyer_subscription on subscription_ticket.destroyer_subscription_id = \ destroyer_subscription.id \
            where subscription.id=$1
            */


            // let result = await pgclient.query("select distinct on(A.id) A.id as id, expire_time, creator_subscription.created as created_date,  get_ticket_consumed_time(cancel_type, canceled_time, lesson.created) as consumed_date, destroyer_subscription.created as destroyed_date \
            // from ((select * from pilates.subscription_ticket where creator_subscription_id=$1) as A  \
            // left join pilates.lesson on A.id = lesson.consuming_client_ss_ticket_id ) \
            // left join pilates.subscription as creator_subscription on creator_subscription_id = creator_subscription.id \
            // left join pilates.subscription as destroyer_subscription on destroyer_subscription_id = destroyer_subscription.id \
            // order by A.id, lesson.created desc  ", [args.subscription_id]).then(res => {
            //     console.log(res.rows)

            //     return {
            //         success: true,
            //         tickets: res.rows
            //     }
            // }).catch(e => {
            //     console.log(e)

            //     return {
            //         success: false,
            //         msg: "query error"

            //     }
            // })

            // return result



            let result = await pgclient.query("SELECT DISTINCT ON (subscription_ticket.id)  subscription_ticket.id as id, expire_time, canceled_time, A.created as created_date, B.created as destroyed_date, get_ticket_consumed_time(cancel_type, canceled_time, lesson.created) as consumed_date from pilates.subscription_ticket  LEFT JOIN pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id LEFT JOIN (select id, created from pilates.subscription) as A on subscription_ticket.creator_subscription_id = A.id LEFT JOIN (select id, created from pilates.subscription) as B on subscription_ticket.destroyer_subscription_id = B.id WHERE creator_subscription_id=$1 order by id , canceled_time desc nulls first", [args.subscription_id]).then(res=>{
                console.log(res.rows)

                return {
                    success: true,
                    tickets: res.rows
                }
            }).catch(e=>{
                console.log(e)

                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result

        },

        query_all_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {

            // console.log(args)


            /* old query
select json_build_object('total_rounds', subscription.rounds, \
            'activity_type', subscription.activity_type, \
            'grouping_type', subscription.grouping_type, \
            'remain_rounds', A.remain_rounds, \
            'subscription_id', subscription.id, \
            'created', subscription.created) \
            from pilates.subscription left join \
            (select count(subscription_ticket.id) as total_rounds, \
            count(case when lesson.id is null then 1 else null end) as remain_rounds,  \
            subscription_ticket.creator_subscription_id as subscription_id \
            from pilates.subscription_ticket \
            left join pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id \
            left join pilates.subscription on subscription_ticket.creator_subscription_id = subscription.id \
            where creator_subscription_id in (select id from pilates.subscription where clientid=$1 order by created) \
            group by subscription_id) as A \
             \
            on A.subscription_id=subscription.id \
            where subscription.clientid = $1 \
            order by created
            */

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

        query_subscriptions_of_clientname: async (parent, args)=>{

            console.log('inside query_subscriptions_of_clientname')
            console.log(args)

            let subscriptions = await pgclient.query('select subscription.id, subscription.clientid, client.name as clientname, rounds, totalcost, subscription.created, subscription.activity_type, subscription.grouping_type, subscription.coupon_backed from pilates.subscription left join pilates.client on subscription.clientid=client.id where client.name=$1',[args.clientname])
            .then(res=>{
                console.log(res.rows)
                return res.rows
            }).catch(e=>{
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
                    "subscriptions": subscriptions
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

            /*
            old query:

            select array_agg(json_build_object(\'id\',subscription_ticket.id, \'expire_time\',subscription_ticket.expire_time)), subscription_ticket.creator_subscription_id as subscription_id, subscription.created  from pilates.subscription_ticket \
             LEFT JOIN pilates.lesson ON subscription_ticket.id = lesson.consuming_client_ss_ticket_id  LEFT JOIN pilates.subscription ON subscription_ticket.creator_subscription_id = subscription.id where  destroyer_subscription_id is null and expire_time > now() and lesson.id is null and \
              creator_subscription_id in ( select id from pilates.subscription where clientid=$1 and activity_type=$2 and grouping_type=$3) GROUP BY subscription_ticket.creator_subscription_id, subscription.created
            */

            let subscriptions = await pgclient.query("select \
            array_agg(json_build_object('id',id, 'expire_time',expire_time)), \
            creator_subscription_id as subscription_id, \
            created \
            from (\
            select distinct on(subscription_ticket.id) \
            subscription_ticket.id,\
            expire_time,\
            lesson.created as lesson_created,\
            lesson.cancel_type,\
            lesson.canceled_time,\
            subscription_ticket.creator_subscription_id,\
            subscription.created  as created\
             from pilates.subscription_ticket \
            left join pilates.lesson ON subscription_ticket.id = lesson.consuming_client_ss_ticket_id\
            LEFT JOIN pilates.subscription ON subscription_ticket.creator_subscription_id = subscription.id \
            where subscription.clientid=$1 \
            and subscription.activity_type=$2 and subscription.grouping_type = $3\
             and \
             destroyer_subscription_id is null and expire_time > now() \
            order by subscription_ticket.id,lesson.created desc\
            ) AS a\
            where get_ticket_consumed_time(a.cancel_type, a.canceled_time, a.lesson_created) is null\
            GROUP BY creator_subscription_id, created", [args.clientid, args.activity_type, args.grouping_type]).then(res => {

                let ret_arr = []



                res.rows.forEach(d => {
                    let item_arrs = d.array_agg
                    //   console.log(item_arrs)

                    let subscription_info = {
                        id: d.subscription_id,
                        created: d.created
                    }

                    ret_arr.push({
                        subscription: subscription_info,
                        tickets: item_arrs
                    })
                })

                return ret_arr
            }).catch(e => {
                console.log(e)
                return null
            })

            if (subscriptions == null) {
                return {
                    success: false
                }
            }



            return {
                success: true,
                subscriptions: subscriptions
            }

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

            let ret = await pgclient.query('insert into pilates.subscription (clientid, rounds, totalcost, activity_type, grouping_type, coupon_backed) values ($1,$2,$3, $4, $5, $6) RETURNING id', [args.clientid, args.rounds, args.totalcost, args.activity_type, args.grouping_type, args.coupon_backed == "" ? null : args.coupon_backed]).then(res => {
                if (res.rowCount > 0) {
                    console.log(res)

                    return [true, res.rows[0].id]
                }
                return [false, null]
            }).catch(e => {
                console.log(e)
                return [false, null]
            })

            let [retbool, created_id] = ret
            if (!retbool) {
                return {
                    success: false
                }
            }

            // // create tickets



            let value_str = ""

            let expiredate = new Date()

            expiredate.setDate(expiredate.getDate() + 30)





            for (let i = 0; i < args.rounds; i++) {
                // order::  expire_time, creator_ssid

                let temp_value_str = `(to_timestamp(${expiredate.getTime() / 1000}), ${created_id})`
                value_str += temp_value_str
                if (i < args.rounds - 1) {
                    value_str += ','
                }
            }

            console.log(value_str)


            ret = await pgclient.query(`insert into pilates.subscription_ticket (expire_time, creator_subscription_id) values ${value_str}`).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }

                return false
            })
                .catch(e => {
                    console.log(e)
                    return false
                })

            // if failed to create tickets, we must remove created subscription

            if (!ret) {
                let delete_ret = await pgclient.query('delete from pilates.subscription where id=$1', [created_id]).then(res => {
                    if (res.rowCount > 0) {
                        return true
                    }
                    return false
                }).catch(e => {
                    console.log(e)
                    return false
                })

                if (!delete_ret) {
                    console.warn("inconsistency occured. failed to delete half created subscription. subscription id = " + created_id)
                }
            }

            return {
                success: ret
            }
        },
        delete_subscription: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query('delete from pilates.subscription where id=$1', [args.id]).then(res => {
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
    }

}