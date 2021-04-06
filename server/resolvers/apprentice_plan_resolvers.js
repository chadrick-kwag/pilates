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
        }

    },
    Mutation: {
        create_apprentice_plan: async (parent, args) => {
            let result = await pgclient.query(`insert into apprentice_instructor_plan (apprentice_instructor_id, rounds, totalcost, activity_type, grouping_type, created) values ($1, $2, $3, $4, $5, now())`, [args.apprentice_instructor_id, args.rounds, args.totalcost, args.activity_type, args.grouping_type]).then(res => {
                return {
                    success: true
                }
            })
                .catch(e => {
                    console.log(e)
                    return {
                        success: false,
                        msg: e.detail
                    }
                })

            return result
        }
    }
}