const pgclient = require('../pgclient')
const { DateTime } = require('luxon')


module.exports = {
    Query: {
        query_clients_by_phonenumber: async (parent, args) => {
            try {

                console.log(args)

                let results = await pgclient.query(`WITH A as (select id, translate(phonenumber, '-','') as phonenumber, name from client)

                select * from A
                where A.phonenumber = $1`, [args.phonenumber])

                console.log(results)

                return {
                    success: true,
                    clients: results.rows
                }

            } catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: e.detail

                }
            }
        },
        query_checkin_lessons_of_client: async (parent, args) => {
            try {

                console.log(args)

                const dt_now = DateTime.now()
                const span_start = dt_now.minus({hours: 1})
        
                const span_end = dt_now.plus({hours: 10})

                console.log(span_start)
                console.log(span_end)

                let results = await pgclient.query(`select lesson.id, lesson.starttime, lesson.endtime, instructor.id as instructorid, instructor.name as instructorname, lesson.activity_type, lesson.grouping_type from  lesson
                left join assign_ticket on assign_ticket.lessonid = lesson.id
                left join ticket on assign_ticket.ticketid = ticket.id
                left join plan on plan.id = ticket.creator_plan_id
                left join instructor on lesson.instructorid = instructor.id
                
                where (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1, $2))
                and lesson.canceled_time is null
                and plan.clientid = $3
                group by lesson.id, lesson.starttime, lesson.endtime, instructor.id, instructor.name, 
                lesson.activity_type, lesson.grouping_type`,[span_start.toJSDate(), span_end.toJSDate(), args.clientid])

                console.log(results)

                return {
                    success: true,
                    lessons: results.rows
                }

            } catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            }
        }
    }

}