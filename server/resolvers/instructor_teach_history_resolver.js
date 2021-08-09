const { _pgclient, pool } = require('../pgclient')
const {
    ensure_admin_account_id_in_context
} = require('./common')

module.exports = {
    Query: {
        query_teach_history_of_instructor_in_timerange: async (parent, args, context) => {


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
                // gather normal lesson history
                let result = await pgclient.query(`with A as (select distinct on(ticketid) assign_ticket.*, ticket.cost as cost,  person.id as studentid, person.name as studentname, 
                person.phonenumber as studentphonenumber from assign_ticket 
                left join ticket on assign_ticket.ticketid = ticket.id
                left join plan on ticket.creator_plan_id = plan.id
                left join client on plan.clientid = client.id
                left join person on person.id= client.personid
                order by ticketid, created desc)
     
                select lesson.*, array_agg(json_build_object('id', B.ticketid,
                                                        'studentpersonid', B.studentid,
                                                        'studentname', B.studentname,
                                                        'studentphonenumber', B.studentphonenumber,
                                                            'cost', B.cost
                                                        )) as tickets from lesson
                left join instructor on instructor.id = lesson.instructorid
                left join person on person.id = instructor.personid
                left join (select * from A where A.canceled_time is null) as B on  B.lessonid = lesson.id
                where person.id = $1
                and lesson.canceled_time is null
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3))
                
                group by lesson.id
     
                `, [args.personid, args.search_starttime, args.search_endtime])

                const normal_lesson_history_arr = result.rows


                // TODO: gather master class lesson history


                const final_history_arr = []

                let id_count = 0
                normal_lesson_history_arr.forEach((d, i) => {
                    d.indomain_id = d.id
                    d.id = id_count++
                    d.domain = 'normal_lesson'

                    final_history_arr.push(d)
                })


                console.log('final_history_arr')
                console.log(final_history_arr)


                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true,
                    teach_history_arr: final_history_arr
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