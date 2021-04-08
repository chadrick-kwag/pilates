const { FlareSharp } = require('@material-ui/icons')
const pgclient = require('../pgclient')


module.exports = {

    Query: {

        fetch_apprentice_instructor_plans: async (parent, args) => {

            let result = await pgclient.query(`select array_agg(json_build_object(
                'id', apprentice_instructor_plan.id,
                'apprentice_instructor_name', apprentice_instructor.name,
                'apprentice_instructor_id', apprentice_instructor.id,
                'activity_type', activity_type,
                'grouping_type', grouping_type,
                'created', apprentice_instructor_plan.created,
                'totalcost', apprentice_instructor_plan.totalcost,
                'rounds', apprentice_instructor_plan.rounds,
                'apprentice_instructor_phonenumber',apprentice_instructor.phonenumber
                
            )) as data from apprentice_instructor_plan
            left join apprentice_instructor on apprentice_instructor.id = apprentice_instructor_plan.apprentice_instructor_id`).then(
                res => {
                    console.log(res)
                    return {
                        success: true,
                        plans: res.rows[0].data
                    }

                }
            ).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }

            })
            console.log(result)
            return result
        },
        fetch_apprentice_plan_by_id: async (parent, args) => {
            let result = await pgclient.query(`select array_agg(json_build_object(
                'id', apprentice_instructor_plan.id,
                'apprentice_instructor_name', apprentice_instructor.name,
                'apprentice_instructor_id', apprentice_instructor.id,
                'activity_type', activity_type,
                'grouping_type', grouping_type,
                'created', apprentice_instructor_plan.created,
                'totalcost', apprentice_instructor_plan.totalcost,
                'rounds', apprentice_instructor_plan.rounds,
                'apprentice_instructor_phonenumber',apprentice_instructor.phonenumber
                
            )) as data from apprentice_instructor_plan
            left join apprentice_instructor on apprentice_instructor.id = apprentice_instructor_plan.apprentice_instructor_id where apprentice_instructor_plan.id=$1`, [args.id]).then(res => {
                return {
                    success: true,
                    plans: res.rows[0].data
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            })

            return result
        },
        fetch_apprentice_tickets_of_plan: async (parent, args) => {
            try {
                let res = await pgclient.query('BEGIN')

                console.log('fetch_apprentice_tickets_of_plan')
                console.log(args)

                res = await pgclient.query(`select apprentice_ticket.id as id, 
                apprentice_ticket.expire_time,
                apprentice_lesson.starttime as consumed_time
                from apprentice_ticket 
                left join (select DISTINCT ON (apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc ) as A on apprentice_ticket.id = A.apprentice_ticket_id
                left join apprentice_lesson on apprentice_lesson.id = A.apprentice_lesson_id
                where creator_plan_id = $1`, [args.id])

                console.log(res.rows)

                await pgclient.query('END')

                return {
                    success: true,
                    tickets: res.rows
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
        }

    },
    Mutation: {
        create_apprentice_plan: async (parent, args) => {
            try {
                let res = await pgclient.query('BEGIN')

                res = await pgclient.query(`insert into apprentice_instructor_plan (apprentice_instructor_id, rounds, totalcost, activity_type, grouping_type, created) values ($1, $2, $3, $4, $5, now()) returning id`, [args.apprentice_instructor_id, args.rounds, args.totalcost, args.activity_type, args.grouping_type])

                let id = res.rows[0].id

                console.log(`returned id: ${id}`)

                res = await pgclient.query(`insert into apprentice_ticket (expire_time, creator_plan_id) (select now(), $1 from generate_series(1,$2))`, [id, args.rounds])

                await pgclient.query('COMMIT')
                console.log('commit finished')
                return {
                    success: true
                }


            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }

        },
        add_apprentice_tickets_to_plan: async (parent, args) => {

            console.log(args)
            try {

                let res = await pgclient.query('BEGIN')

                // check plan with id exist
                res = await pgclient.query(`select * from apprentice_instructor_plan where id=$1`, [args.id])

                if (res.rows.length === 0) {
                    return {
                        success: false,
                        msg: 'no plan with id found'
                    }
                }

                console.log('plan exist checked')
                console.log(`id type: ${typeof (args.id)}`)
                // get per round cost
                res = await pgclient.query(`select totalcost/A.count as percost, totalcost from apprentice_instructor_plan 
                left join (select count(1), $1::int as id from apprentice_ticket where creator_plan_id = $2::int ) as A on A.id = apprentice_instructor_plan.id where apprentice_instructor_plan.id = $3::int`, [args.id, args.id, args.id])

                console.log(res)

                if (res.rows.length !== 1) {
                    return {
                        success: false,
                        msg: 'per ticket cost query fail'
                    }
                }

                let percost = res.rows[0].percost
                let totalcost = res.rows[0].totalcost

                console.log(res)

                res = await pgclient.query(`select DISTINCT ON(expire_time) *  from apprentice_ticket where creator_plan_id=$1
                order by expire_time desc`, [args.id])

                console.log(res)

                let expire_time
                if (res.rows.length === 0) {
                    return {
                        success: false,
                        msg: 'expire time get fail'
                    }
                }

                console.log(res.rows[0].expire_time)
                expire_time = res.rows[0].expire_time

                console.log('expire_time')
                console.log(expire_time)

                // insert new tickets
                res = await pgclient.query(`insert into apprentice_ticket (expire_time, creator_plan_id) (select $1, $2 from generate_series(1,$3))`, [expire_time, args.id, args.amount])

                // update totalcost of plan
                let newtotalcost = totalcost + args.amount * percost

                res = await pgclient.query(`update apprentice_instructor_plan set totalcost=$1 where id=$2`, [newtotalcost, args.id])

                res = await pgclient.query('COMMIT')

                return {
                    success: true
                }

            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },
        change_expire_time_of_apprentice_tickets: async (parent, args) => {

            console.log(args)

            if (args.id_arr.length === 0) {
                return {
                    success: false,
                    msg: 'no id given'
                }
            }

            try {
                let res = await pgclient.query('BEGIN')

                for (let i = 0; i < args.id_arr.length; i++) {
                    res = await pgclient.query(`update apprentice_ticket set expire_time=$1 where id=$2`, [args.new_expire_time, args.id_arr[i]])
                }

                res = await pgclient.query('COMMIT')

                return {
                    success: true

                }

            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        }
    }
}