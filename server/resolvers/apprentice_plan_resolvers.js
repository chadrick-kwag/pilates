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

        }
    }
}