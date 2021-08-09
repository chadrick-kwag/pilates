const { pool } = require('../pgclient')
const { DateTime } = require('luxon')
const { setting } = require('../adminappconfig')
const randomstring = require("randomstring");
const { token_cache, add_token, check_token } = require('../checkintokencache')


module.exports = {
    Query: {
        check_token: async (parent, args, context) => {

            try {

                if (!context.checkinAuthorized) {
                    return {
                        success: true,
                        msg: 'invalid token',
                        is_valid: false

                    }
                }


                return {
                    success: true,
                    is_valid: true
                }
            }
            catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: 'error'
                }
            }


        },
        query_clients_by_phonenumber: async (parent, args, context) => {

            if (!context.checkinAuthorized) {
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

                console.log(args)

                let results = await pgclient.query(`WITH A as (select client.id, translate(person.phonenumber, '-','') as phonenumber, person.name from client
                left join person on person.id = client.personid)

                select * from A
                where A.phonenumber = $1`, [args.phonenumber])

                console.log(results)
                pgclient.release()

                return {
                    success: true,
                    clients: results.rows
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
        query_checkin_lessons_of_client: async (parent, args, context) => {


            if (!context.checkinAuthorized) {
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

                const dt_now = DateTime.now()
                const scan_prev_hours = setting.checkin_options.scan_prev_hours
                const scan_next_hours = setting.checkin_options.scan_next_hours

                if (typeof (scan_prev_hours) !== 'number' || scan_prev_hours <= 0) {
                    throw 'invalid scan_prev_hours'
                }

                if (typeof (scan_next_hours) !== 'number' || scan_next_hours <= 0) {
                    throw 'invalid scan_next_hours'
                }

                const span_start = dt_now.minus({ hours: scan_prev_hours })

                const span_end = dt_now.plus({ hours: scan_next_hours })

                let results = await pgclient.query(`select lesson.id, lesson.starttime, lesson.endtime, instructor.id as instructorid, person.name as instructorname, lesson.activity_type, lesson.grouping_type from  lesson
                left join assign_ticket on assign_ticket.lessonid = lesson.id
                left join ticket on assign_ticket.ticketid = ticket.id
                left join plan on plan.id = ticket.creator_plan_id
                left join instructor on lesson.instructorid = instructor.id
                left join person on person.id = instructor.personid
				left join (select * from normal_lesson_attendance where clientid=$3) as B on B.lessonid = lesson.id
                
                where (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1, $2))
                and lesson.canceled_time is null
                and plan.clientid = $3
				and B.id is null
				
                group by lesson.id, lesson.starttime, lesson.endtime, instructor.id, person.name, 
                lesson.activity_type, lesson.grouping_type`, [span_start.toJSDate(), span_end.toJSDate(), args.clientid])

                console.log(results)

                pgclient.release()

                return {
                    success: true,
                    lessons: results.rows
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
    },
    Mutation: {
        get_new_token: async (parent, args, context) => {
            // check incoming password
            // if correct, then return token


            // check password
            if (args.password !== setting.checkin_options.password) {
                return {
                    success: false,
                    msg: 'incorrect password'
                }
            }

            // generate token
            let token = randomstring.generate({ length: 10 })

            while (check_token(token)) {
                token = randomstring.generate({ length: 10 })
            }

            add_token(token)

            return {
                success: true,
                token: token
            }

        },
        checkin_lesson_for_client: async (parent, args, context) => {


            if (!context.checkinAuthorized) {
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
                await pgclient.query('BEGIN')


                let result = await pgclient.query(`insert into normal_lesson_attendance(lessonid, clientid, checkin_time) values ($1, $2, now())`, [args.lessonid, args.clientid])

                if (result.rowCount !== 1) {
                    throw "insert row count not 1"
                }

                await pgclient.query('COMMIT')
                pgclient.release()

                return {
                    success: true

                }
            }
            catch (e) {

                try {
                    await pgclient.query('END')
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
        }
    }

}