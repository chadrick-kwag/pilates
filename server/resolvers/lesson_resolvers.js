const { pool } = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    ensure_admin_account_id_in_context,
    incoming_time_string_to_postgres_epoch_time
} = require('./common')

const ERRCODES = require('../../src/common/errcode')

module.exports = {

    Query: {
        query_attendance_info_of_lessonid: async (parent, args, context) => {

            console.log('query_attendance_info_of_lessonid')
            console.log(args)


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
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

                // gather clients registered to lesson

                let result = await pgclient.query(`with A as (select distinct on(ticketid) * from assign_ticket where lessonid = $1 order by ticketid, created desc )


                select distinct on(client.id) normal_lesson_attendance.id as attendance_id, client.id as clientid,  person.name as clientname, person.phonenumber as clientphonenumber ,
                normal_lesson_attendance.checkin_time
                from A
                left join ticket on ticket.id = A.ticketid
                left join plan on ticket.creator_plan_id = plan.id
                left join client on plan.clientid = client.id
                left join person on person.id = client.personid
                left join normal_lesson_attendance on normal_lesson_attendance.clientid = client.id and normal_lesson_attendance.lessonid = $1
                where A.canceled_time is null
                order by client.id`, [args.lessonid])

                pgclient.release()
                return {
                    success: true,
                    attendance_info: result.rows
                }



            }
            catch (e) {
                pgclient.release()
                return {
                    success: false
                }
            }
        },
        query_lessons_with_daterange_sensitive_info_removed: async (parent, args) => {

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

                // gather normal lessons

                // first get basic lesson info
                let res = await pgclient.query(`select lesson.id as indomain_id, 'normal_lesson' as lesson_domain, lesson.instructorid, person.name as instructorname, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type from lesson
                left join instructor on lesson.instructorid = instructor.id
                left join person on person.id = instructor.personid
                where lesson.canceled_time is null
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1,$2))`, [args.start_time, args.end_time])

                // get client info arr for each lesson
                const normal_lessons = []
                for (let i = 0; i < res.rowCount; i++) {
                    const d = res.rows[i]

                    const lessonid = d.indomain_id

                    let sub_result = await pgclient.query(`WITH A AS (select DISTINCT ON(ticketid) normal_lesson_attendance.checkin_time, person.name as clientname,
                    assign_ticket.lessonid, assign_ticket.ticketid, 
                    assign_ticket.created, assign_ticket.canceled_time,
                    plan.clientid from assign_ticket
                    left join ticket on ticket.id = assign_ticket.ticketid
                    left join plan on ticket.creator_plan_id = plan.id
                    left join client on plan.clientid = client.id
                    left join person on client.personid = person.id
                    left join normal_lesson_attendance on normal_lesson_attendance.lessonid = assign_ticket.lessonid and normal_lesson_attendance.clientid = client.id
                    where assign_ticket.lessonid = $1
                    ORDER BY ticketid, created desc)
                    
                    select  A.clientid, A.clientname, 
                    array_agg(A.ticketid) as ticketid_arr, 
                    A.checkin_time from A where A.canceled_time is null
                    and A.clientid is not null
                    group by  A.clientid, A.clientname, A.checkin_time`, [lessonid])

                    if (sub_result.rowCount > 0) {
                        d.client_info_arr = sub_result.rows
                        normal_lessons.push(d)
                    }
                }


                // gather apprentice lessons

                res = await pgclient.query(`select apprentice_lesson.id as indomain_id,
                apprentice_lesson.apprentice_instructor_id as instructorid,
                person.name as instructorname,
                
                apprentice_lesson.starttime,
                apprentice_lesson.endtime,
                apprentice_lesson.created,
                apprentice_lesson.activity_type,
                apprentice_lesson.grouping_type,
                count(CASE
                      WHEN A.id is null THEN null
                      ELSE true
                     END)::int as assigned_ticket_count
                from apprentice_lesson
                left join (select distinct on(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc)
                as A on A.apprentice_lesson_id = apprentice_lesson.id
                left join apprentice_instructor on apprentice_instructor.id  = apprentice_lesson.apprentice_instructor_id
                left join person on person.id = apprentice_instructor.personid
                where apprentice_lesson.canceled_time is null
                AND (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($1, $2) )
                
                
                group by apprentice_lesson.id, apprentice_instructor.id, person.name`, [args.start_time, args.end_time])


                const apprentice_lessons = res.rows.filter(d => d.assigned_ticket_count > 0)


                // assign domain type 

                apprentice_lessons.forEach((d, i) => {
                    d['lesson_domain'] = 'apprentice_lesson'

                })



                // fetch special schedules
                res = await pgclient.query(`select id as indomain_id, starttime, endtime, title, memo from special_schedule where  (tstzrange(starttime, endtime) && tstzrange($1, $2) )`, [args.start_time, args.end_time])

                const special_schedules = res.rows

                special_schedules.forEach((d, i) => {
                    d['lesson_domain'] = 'special_schedule'
                })

                await pgclient.query('end')

                const all_lessons = normal_lessons.concat(apprentice_lessons).concat(special_schedules)

                all_lessons.forEach((d, i) => {
                    d['id'] = i
                })

                pgclient.release()

                return {
                    success: true,
                    lessons: all_lessons

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
        query_lesson_detail_with_lessonid: async (parent, args) => {

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
                await pgclient.query('begin')

                const lessonid = args.lessonid

                // fetch instructor and lesson basic info
                let result = await pgclient.query(`select lesson.id as id, person.name as instructorname, person.phonenumber as instructorphonenumber, instructor.id as instructorid, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type from lesson
                left join instructor on instructor.id = lesson.instructorid 
                left join person on person.id = instructor.personid
                where lesson.id= $1 `, [lessonid])

                if (result.rows.length !== 1) {
                    throw {
                        detail: 'invalid lesson id'
                    }
                }

                const lesson_basic_info = result.rows[0]

                console.log('lesson_basic_info')
                console.log(lesson_basic_info)

                // fetch client and ticket info
                result = await pgclient.query(`WITH A as (select distinct on(ticketid) ticketid, client.id as clientid, person.name as clientname, person.phonenumber as clientphonenumber, plan.id as planid, assign_ticket.canceled_time
                from assign_ticket
                left join ticket on ticket.id = assign_ticket.ticketid
                left join plan on ticket.creator_plan_id = plan.id
                left join client on client.id = plan.clientid
                left join person on person.id = client.personid
                where assign_ticket.lessonid = $1
                order by ticketid, assign_ticket.created desc)

                select A.clientid, A.clientname, array_agg(A.ticketid) as ticketid_arr, A.clientphonenumber, normal_lesson_attendance.checkin_time from A
                left join normal_lesson_attendance on normal_lesson_attendance.clientid = A.clientid and normal_lesson_attendance.lessonid = $1
                where A.canceled_time is null
                group by A.clientid, A.clientname, A.clientphonenumber, normal_lesson_attendance.checkin_time
                `, [lessonid])


                const detail = {
                    ...lesson_basic_info,
                    client_info_arr: result.rows
                }

                console.log('detail')
                console.log(detail)


                await pgclient.query(`commit`)
                pgclient.release()

                return {
                    success: true,
                    detail: detail
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


        query_lessons_with_daterange: async (parent, args) => {

            console.log('query_lessons_with_daterange')
            console.log(args)

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

                // gather normal lessons

                // first get basic lesson info
                let res = await pgclient.query(`select lesson.id as indomain_id, 'normal_lesson' as lesson_domain, lesson.instructorid, person.name as instructorname, person.phonenumber as instructorphonenumber, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type from lesson
                left join instructor on lesson.instructorid = instructor.id
                left join person on person.id = instructor.personid
                where lesson.canceled_time is null
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1,$2))`, [args.start_time, args.end_time])

                // get client info arr for each lesson
                const normal_lessons = []
                for (let i = 0; i < res.rowCount; i++) {
                    const d = res.rows[i]

                    const lessonid = d.indomain_id

                    let sub_result = await pgclient.query(`WITH A AS (select DISTINCT ON(ticketid) normal_lesson_attendance.checkin_time, person.phonenumber as clientphonenumber, person.name as clientname,
                    assign_ticket.lessonid, assign_ticket.ticketid, 
                    assign_ticket.created, assign_ticket.canceled_time,
                    plan.clientid from assign_ticket
                    left join ticket on ticket.id = assign_ticket.ticketid
                    left join plan on ticket.creator_plan_id = plan.id
                    left join client on plan.clientid = client.id
                    left join person on person.id = client.personid
                    left join normal_lesson_attendance on normal_lesson_attendance.lessonid = assign_ticket.lessonid and normal_lesson_attendance.clientid = client.id
                    where assign_ticket.lessonid = $1
                    ORDER BY ticketid, created desc)
                    
                    select  A.clientid, A.clientname, A.clientphonenumber, 
                    array_agg(A.ticketid) as ticketid_arr, 
                    A.checkin_time from A where A.canceled_time is null
                    and A.clientid is not null
                    group by  A.clientid, A.clientname, A.clientphonenumber, A.checkin_time`, [lessonid])

                    if (sub_result.rowCount > 0) {
                        d.client_info_arr = sub_result.rows
                        normal_lessons.push(d)
                    }
                }

                console.log(`modified normal lessons: ${normal_lessons}`)

                // gather apprentice lessons

                res = await pgclient.query(`select apprentice_lesson.id as indomain_id,
                apprentice_lesson.apprentice_instructor_id as instructorid,
                person.name as instructorname,
                person.phonenumber as instructorphonenumber,
                apprentice_lesson.starttime,
                apprentice_lesson.endtime,
                apprentice_lesson.created,
                apprentice_lesson.activity_type,
                apprentice_lesson.grouping_type,
                count(CASE
                      WHEN A.id is null THEN null
                      ELSE true
                     END)::int as assigned_ticket_count
                from apprentice_lesson
                left join (select distinct on(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc)
                as A on A.apprentice_lesson_id = apprentice_lesson.id
                left join apprentice_instructor on apprentice_instructor.id  = apprentice_lesson.apprentice_instructor_id
                left join person on person.id = apprentice_instructor.personid
                where apprentice_lesson.canceled_time is null
                AND (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($1, $2) )
                group by apprentice_lesson.id, apprentice_instructor.id, person.name, person.phonenumber`, [args.start_time, args.end_time])


                const apprentice_lessons = res.rows.filter(d => d.assigned_ticket_count > 0)


                // assign domain type 

                apprentice_lessons.forEach((d, i) => {
                    d['lesson_domain'] = 'apprentice_lesson'

                })



                // fetch special schedules
                res = await pgclient.query(`select id as indomain_id, starttime, endtime, title, memo from special_schedule where  (tstzrange(starttime, endtime) && tstzrange($1, $2) )`, [args.start_time, args.end_time])

                const special_schedules = res.rows

                special_schedules.forEach((d, i) => {
                    d['lesson_domain'] = 'special_schedule'
                })

                await pgclient.query('end')

                const all_lessons = normal_lessons.concat(apprentice_lessons).concat(special_schedules)

                all_lessons.forEach((d, i) => {
                    d['id'] = i
                })

                pgclient.release()
                return {
                    success: true,
                    lessons: all_lessons

                }
            } catch (e) {
                // throw e
                console.error(e)
                try {
                    await pgclient.query('ROLLBACK')
                    pgclient.release()
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    console.error(err)
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }

        },

        query_lesson_with_timerange_by_clientid: async (parent, args) => {
            console.log(args)

            let clientid = args.clientid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000

            console.log(start_time)
            console.log(end_time)

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
                let result = await pgclient.query(`WITH B AS (select lesson.id as id
                    , lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type,
                    instructor.id as instructorid, instructor.name as instructorname, instructor.phonenumber as instructorphonenumber
                                
                                from lesson
                    inner join (select distinct on(ticketid) * from assign_ticket where canceled_time is null order by ticketid, created desc) as A on lesson.id = A.lessonid
                            left join instructor on lesson.instructorid = instructor.id
                    left join ticket on A.ticketid = ticket.id
                    left join plan on ticket.creator_plan_id = plan.id
                    where plan.clientid = $1
                                AND lesson.canceled_time is null
                                AND (tstzrange(lesson.starttime, lesson.endtime) && tstzrange(to_timestamp($2), to_timestamp($3)) )
                            ),
                    
                    C AS (select B.id as lessonid, array_agg(json_build_object('clientname', client.name ,'clientid', client.id, 'clientphonenumber', client.phonenumber )) as client_info_arr
                    from B
                    inner join (select distinct on(ticketid) * from assign_ticket where canceled_time is null order by ticketid, created desc) as A on B.id = A.lessonid
                    left join ticket on ticket.id = A.ticketid
                    left join plan on ticket.creator_plan_id = plan.id
                    left join client on plan.clientid = client.id
                    GROUP BY B.id)
                    
                    
                    select B.*, C.client_info_arr from B
                    left join C on B.id = C.lessonid `, [clientid, start_time, end_time])


                pgclient.release()

                return {
                    success: true,
                    lessons: result.rows
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
        query_lesson_with_timerange_by_instructorid: async (parent, args) => {
            console.log(args)

            let instructorid = args.instructorid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000

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
                let result = await pgclient.query(`WITH B AS (select  lesson.id as id, instructor.id as instructorid,
                    instructor.name as instructorname, 
                    instructor.phonenumber as instructorphonenumber,
                    lesson.starttime, lesson.endtime,
                    lesson.activity_type,
                    lesson.grouping_type,
                    
                     count(1) FILTER (where A.id is not null AND A.canceled_time is null) > 0  as valid_assign_exist ,
                     lesson.canceled_time as lesson_canceled_time,
                     array_agg(ticket.id) as ticket_id_arr,
                     array_agg(json_build_object('clientname', client.name ,'clientid', client.id, 'clientphonenumber', client.phonenumber )) as client_info_arr
                    from lesson 
                    left join (select DISTINCT ON(ticketid) * from assign_ticket ORDER BY ticketid, created desc) AS A on lesson.id = A.lessonid
                    left join ticket on A.ticketid = ticket.id
                    left join plan on ticket.creator_plan_id = plan.id
                    left join client on plan.clientid = client.id
                    left join instructor on lesson.instructorid = instructor.id
                    where lesson.canceled_time is null
                    AND instructor.id = $1
                     AND (tstzrange(lesson.starttime, lesson.endtime) && tstzrange(to_timestamp($2), to_timestamp($3)) )
                        
                    GROUP BY lesson.id, instructor.id)
                    select * from B where valid_assign_exist is true `, [instructorid, start_time, end_time])

                pgclient.release()

                return {
                    success: true,
                    lessons: result.rows
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
        query_lesson_with_timerange_by_instructor_personid: async (parent, args, context) => {

            console.log('query_lesson_with_timerange_by_instructor_personid')

            // TODO: check if instructor user
            const instructor_personid = context.instructor_personid

            if (instructor_personid === null || instructor_personid === undefined) {
                return {
                    success: false,
                    msg: 'unauthorized access'
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

                // fetch normal lessons

                let result = await pgclient.query(`
                with A as (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc)
                
                select 'normal_lesson' as lesson_domain,
                lesson.id as indomain_id,
                instructor.id as instructorid,
                person.name as instructorname,
                person.phonenumber as instructorphonenumber,
                lesson.starttime,
                lesson.endtime,
                lesson.activity_type,
                lesson.grouping_type,
                array_agg(json_build_object('clientid', client.id,
                                               'clientname', clientperson.name,
                                            'clientphonenumber', clientperson.phonenumber,
                                            'checkin_time', normal_lesson_attendance.checkin_time
                                           )) as client_info_arr
                
                
                from lesson
                left join instructor on instructor.id = lesson.instructorid
                left join person on person.id = instructor.personid
                left join (select * from A where canceled_time is null) as B on B.lessonid = lesson.id
                left join ticket on B.ticketid = ticket.id
                left join plan on ticket.creator_plan_id = plan.id
                left join client on client.id = plan.clientid
                left join person as clientperson on clientperson.id = client.personid
                left join normal_lesson_attendance on normal_lesson_attendance.clientid = client.id and normal_lesson_attendance.lessonid = lesson.id
                
                
                where lesson.canceled_time is null
                and person.id = $1
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3))
                
                group by lesson.id, instructor.id, person.name, person.phonenumber
                `, [instructor_personid, args.start_time, args.end_time])

                const normal_lessons = result.rows

                // gather apprentice lessons

                result = await pgclient.query(`select 'apprentice_lesson' as lesson_domain,
                apprentice_lesson.id as indomain_id,
                apprentice_instructor.id as instructorid,
                person.name as instructorname,
                person.phonenumber as instructorphonenumber,
                apprentice_lesson.starttime,
                apprentice_lesson.endtime,
                apprentice_lesson.activity_type,
                apprentice_lesson.grouping_type
                
                from apprentice_lesson
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id 
                left join person on person.id  = apprentice_instructor.personid
                where person.id = $1
                and apprentice_lesson.canceled_time is null
                and (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($2, $3))
                `, [instructor_personid, args.start_time, args.end_time])

                const apprentice_lessons = result.rows
                const total_lessons = normal_lessons.concat(apprentice_lessons)

                await pgclient.query('commit')
                pgclient.release()


                return {
                    success: true,
                    lessons: total_lessons
                }


            } catch (e) {
                console.log(e)


                await pgclient.query('rollback')
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        query_lesson_data_of_instructorid: async (parent, args) => {



            console.log('query_lesson_data_of_instructorid')
            console.log(args)

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

                // check if insturctor has level
                let result = await pgclient.query(`select instructor.level, instructor_level.non_group_lesson_pay_percentage, instructor_level.group_lesson_perhour_payment, instructor_level.group_lesson_perhour_penalized_payment 
                from instructor
                left join instructor_level on instructor_level.id = instructor.level where instructor.id = $1`, [args.instructorid])

                console.log(result.rows)

                if (result.rows.length !== 1) {
                    throw {

                        detail: 'no instructor found'
                    }
                }

                if (result.rows[0].level === null) {
                    throw {
                        errcode: ERRCODES.INSTRUCTOR_HAS_NO_LEVEL.code,
                        detail: 'invalid instructor level for this instructor'
                    }
                }




                const non_group_lesson_pay_percentage = parseFloat(result.rows[0].non_group_lesson_pay_percentage)
                const group_lesson_perhour_payment = result.rows[0].group_lesson_perhour_payment
                const group_lesson_perhour_penalized_payment = result.rows[0].group_lesson_perhour_penalized_payment


                if (non_group_lesson_pay_percentage === null || group_lesson_perhour_payment === null || group_lesson_perhour_penalized_payment === null) {
                    throw {
                        detail: 'percentage or payment not defined'
                    }
                }




                const data = []
                // gather lesosn and assigned tickets, grouped by clent
                result = await pgclient.query(`with C as (select lesson.id, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type, 
                    extract(hour from lesson.endtime - lesson.starttime)::int as duration, plan.clientid, 
                    client.name as clientname, client.phonenumber as clientphonenumber,
                    array_agg(A.ticketid) filter (where A.canceled_time is null) as ticket_id_arr ,
                    sum(ticket.cost) filter (where A.canceled_time is null) as ticket_cost_sum
                    
                    from lesson 
         left join (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc) as A on A.lessonid = lesson.id
         left join ticket on A.ticketid = ticket.id
         left join plan on ticket.creator_plan_id = plan.id
         left join client on plan.clientid = client.id
         where instructorid=$1 and lesson.canceled_time is null AND (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3))
         group by lesson.id, plan.clientid, client.name, client.phonenumber)
         
         select id, activity_type, grouping_type, duration, starttime, endtime,
         array_agg(json_build_object('clientid', clientid, 'clientname', clientname, 'clientphonenumber', 
                                     clientphonenumber, 'ticket_id_arr', ticket_id_arr)) as client_tickets,
                   C.ticket_cost_sum 
         from C
         group by id, starttime, endtime, activity_type, grouping_type, duration, ticket_cost_sum`, [args.instructorid, args.search_starttime, args.search_endtime])

                const lesson_info_arr = result.rows

                console.log('lesson_info_arr')
                console.log(lesson_info_arr)


                // for each lesson's tickets, gather it per client and check if it matches durationhours
                for (let i = 0; i < lesson_info_arr.length; i++) {
                    const li = lesson_info_arr[i]

                    console.log(li)

                    // gather client info arr
                    const client_info_arr = []



                    // check ticket count matches duration
                    for (let j = 0; j < li.client_tickets.length; j++) {
                        const tia = li.client_tickets[j]
                        console.log('tia')
                        console.log(tia)
                        if (tia.ticket_id_arr.length !== li.duration) {
                            throw {
                                detail: `client ticket count and duration dont match. duration=${li.duration}, client_tickets length=${tia.length}`
                            }
                        }

                        // gather client info
                        client_info_arr.push({
                            id: tia.clientid,
                            name: tia.clientname,
                            phonenumber: tia.clientphonenumber
                        })
                    }

                    console.log('client_info_arr')
                    console.log(client_info_arr)


                    const gt = li.grouping_type
                    const at = li.activity_type
                    let totalcost = 0

                    // based on grouping type, get total cost
                    if (gt === 'GROUP') {
                        let per_hour_cost = null
                        if (li.client_tickets.length === 1) {
                            per_hour_cost = group_lesson_perhour_penalized_payment
                        }
                        else if (li.client_tickets.length > 5) {
                            per_hour_cost = group_lesson_perhour_payment + 10000
                        }
                        else {
                            per_hour_cost = group_lesson_perhour_payment
                        }

                        totalcost = per_hour_cost * li.duration
                    }
                    else {
                        // sum up all ticket costs
                        totalcost = li.ticket_cost_sum

                        totalcost = Math.ceil(totalcost * non_group_lesson_pay_percentage)

                    }


                    console.log('totalcost')
                    console.log(totalcost)


                    // add row to data
                    let out = {
                        id: li.id,
                        starttime: li.starttime,
                        endtime: li.endtime,
                        activity_type: at,
                        grouping_type: gt,
                        totalcost: totalcost,
                        client_info_arr: client_info_arr

                    }

                    console.log('out')
                    console.log(out)

                    data.push(out)

                }

                console.log('data')
                console.log(data)

                pgclient.release()
                return {
                    success: true,
                    lesson_info_arr: data
                }



            } catch (e) {

                console.log(e)
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail,
                    errcode: e.errcode
                }

            }

        }
    },
    Mutation: {

        remove_normal_lesson_attendance: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
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

                await pgclient.query(`delete from normal_lesson_attendance where lessonid=$1 and clientid=$2`, [args.lessonid, args.clientid])

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
                catch (e2) {

                    return {
                        success: false,
                        msg: e.detail
                    }

                }

                return {
                    success: false,
                    msg: e.detail
                }

            }
        },

        create_normal_lesson_attendance: async (parent, args, context) => {



            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
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

                // check if client is registered to lesson
                // do this by checking if assigned ticket exists
                let result = await pgclient.query(`with A as (select distinct on (ticketid) * from assign_ticket  where lessonid=$1 order by ticketid, created desc )

                select * from A
                left join ticket on ticket.id = A.ticketid
                left join plan on plan.id = ticket.creator_plan_id
                where A.lessonid = $1 and plan.clientid=$2 and A.canceled_time is null
                `, [args.lessonid, args.clientid])

                if (result.rowCount === 0) {
                    throw {
                        detail: 'client not registered to lesson'
                    }
                }

                // check if already checked in
                result = await pgclient.query(`select * from normal_lesson_attendance where lessonid=$1 and clientid=$2`, [args.lessonid, args.clientid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'already checked in'
                    }
                }

                // create attendacne
                await pgclient.query(`insert into normal_lesson_attendance (lessonid, clientid, checkin_time) values ($1, $2, now()) `, [args.lessonid, args.clientid])

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
                        msg: `failed to rollback. original error msg: ${e.detail}`
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },


        create_lesson: async (parent, args, context) => {
            console.log('inside create_lesson')
            console.log(args)

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
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

                if (args.ticketids.length < 1) {
                    throw {
                        detail: 'no tickets given'
                    }
                }

                // check tickets exist
                for (let i = 0; i < args.ticketids.length; i++) {
                    const r = await pgclient.query(`select id from ticket where id=$1`, [args.ticketids[i]])

                    if (r.rowCount === 0) {
                        throw {
                            detail: `no ticket with id=${args.ticketids[i]} found`
                        }
                    }
                }


                // check instructor exist
                let result = await pgclient.query(`select id from instructor where id=$1`, [args.instructorid])

                if (result.rowCount < 1) {
                    throw {
                        detail: 'instructor not found'
                    }
                }

                // get clientid of tickets
                const clientid_set = new Set()

                for (let i = 0; i < args.ticketids.length; i++) {
                    result = await pgclient.query(`select plan.clientid from ticket left join plan on ticket.creator_plan_id = plan.id where ticket.id=$1`, [args.ticketids[i]])

                    clientid_set.add(result.rows[0].clientid)
                }

                // check if overlapping lesson exist for instructor

                result = await pgclient.query(`select lesson.id from lesson where ( tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1,$2) ) and instructorid=$3 and canceled_time is null`, [args.starttime, args.endtime, args.instructorid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'instructor has overlapping schedule'
                    }
                }

                // check if overlapping lesson exist for client
                for (let cid of clientid_set) {
                    result = await pgclient.query(`with A as (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc)

                    select lesson.id from A
                    left join ticket on ticket.id = A.ticketid
                    left join plan on ticket.creator_plan_id = plan.id
                    left join lesson on A.lessonid = lesson.id
                    where lesson.canceled_time is null
                    AND A.canceled_time is null
                    AND ( tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1, $2) )
                    AND plan.clientid=$3`, [args.starttime, args.endtime, cid])

                    if (result.rowCount > 0) {
                        throw {
                            detail: `client id=${cid} has overlapping lesson`
                        }
                    }
                }

                // first create lesson
                result = await pgclient.query(`insert into lesson (instructorid, starttime, endtime, created, activity_type, grouping_type) values ($1,$2,$3, now(), $4, $5) returning id`, [args.instructorid, args.starttime, args.endtime, args.activity_type, args.grouping_type])

                const created_lesson_id = result.rows[0].id


                // update assign tickets
                for (let i = 0; i < args.ticketids.length; i++) {

                    result = await pgclient.query(`insert into assign_ticket (ticketid, lessonid, created) values ($1, $2, now())`, [args.ticketids[i], created_lesson_id])
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
                catch (e2) {
                    console.log(e2)

                }

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },

        delete_lesson: async (parent, args) => {
            console.log("delete_lesson")
            console.log(args)




            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            let lessonid = args.lessonid

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
                let result = await pgclient.query("update pilates.lesson set cancel_type='BUFFERED_CLIENT_REQ_CANCEL', canceled_time=now() where id=$1", [lessonid])

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

        delete_lesson_with_request_type: async (parent, args, context) => {
            /* 
            success: Boolean
            warning: Boolean
            msg: String
            */

            console.log('delete_lesson_with_request_type')
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

                await pgclient.query(`begin`)

                // check lesson id is valid
                let result = await pgclient.query(`select id from lesson where id=$1`, [args.lessonid])

                if (result.rows.length !== 1) {

                    throw {
                        detail: 'invalid lesson id'
                    }

                }

                // check request type
                // if req type is 'admin', then remove all ticket assignments, like they never existed
                // remove lesson too
                if (args.request_type === 'admin_req') {

                    // fetch admin personid
                    const admin_account_id = context.account_id

                    
                    // remove assign tickets
                    await pgclient.query(`delete from assign_ticket where lessonid=$1`, [args.lessonid])

                    // remove related attendances
                    await pgclient.query(`delete from normal_lesson_attendance where lessonid=$1`, [args.lessonid])


                    // cancel lesson
                    await pgclient.query(`update lesson set canceled_time=now(), cancel_type='ADMIN', cancel_request_personid=$1, cancel_request_role='admin'
                    where id=$2`, [admin_account_id, args.lessonid])

                    // remove lesson
                    // await pgclient.query(`delete from lesson where id=$1`, [args.lessonid])

                    await pgclient.query('commit')
                    pgclient.release()
                    return {
                        success: true
                    }
                }
                else if (args.request_type === 'instructor_req') {

                    // if attended client exist, then abort
                    result = await pgclient.query(`select id from normal_lesson_attendance where lessonid=$1`, [args.lessonid])

                    if (result.rowCount > 0) {
                        throw {
                            detail: "attended client exist"
                        }
                    }

                    // get instructor person id of current lesson
                    result = await pgclient.query(`select instructor.personid as personid from lesson
                    left join instructor on instructor.id = lesson.instructorid
                    where lesson.id = $1
                    `,[args.lessonid])

                    const inst_personid = result.rows[0].personid

                    // remove assign tickets which are alive
                    await pgclient.query(`delete from assign_ticket where lessonid=$1 and canceled_time is null`, [args.lessonid])

                    // do not remove lesson but populate cancel time wth cancel type
                    await pgclient.query(`update lesson set canceled_time=now(), cancel_type='INSTRUCTOR_REQUEST', cancel_request_personid=$1, cancel_request_role='instructor' where id=$2`, [inst_personid, args.lessonid])

                    await pgclient.query('commit')
                    pgclient.release()
                    return {
                        success: true
                    }
                }
                else {
                    throw {
                        detail: "invalid request type"
                    }
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    pgclient.release()
                }
                catch (err) {
                    console.log(err)
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        create_individual_lesson: async (parent, args) => {

            // check that ticket's owner matches given client id

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

                let client_check = await pgclient.query('select subscription.clientid from pilates.subscription_ticket left join pilates.subscription on subscription_ticket.creator_subscription_id=subscription.id where subscription_ticket.id=$1', [args.ticketid])

                if (client_check.rowCount === 0) {
                    throw {
                        detail: 'invalid ticket id'
                    }
                }

                if (client_check.rows[0] !== args.clientid) {
                    throw {
                        detail: 'client id not match'
                    }
                }


                console.log(incoming_time_string_to_postgres_epoch_time(args.starttime))
                console.log(incoming_time_string_to_postgres_epoch_time(args.endtime))

                let result = await pgclient.query('insert into pilates.lesson (clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) select $1, $2, to_timestamp($3), to_timestamp($4), $5 where not exists ( select * from pilates.lesson where (lesson.clientid=$1 or lesson.instructorid=$2) and ( tstzrange($3, $4) && tstzrange(lesson.starttime, lesson.endtime) ) and canceled_time is null )', [args.clientid, args.instructorid, args.starttime, args.endtime, args.ticketid])


                if (result.rowCount === 0) {
                    throw {
                        detail: 'insert failed'
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
                } catch { }

                return {
                    success: false,
                    msg: e.detail
                }
            }

            // let client_check = await pgclient.query('select subscription.clientid from pilates.subscription_ticket left join pilates.subscription on subscription_ticket.creator_subscription_id=subscription.id where subscription_ticket.id=$1', [args.ticketid]).then(res => {
            //     console.log(res)

            //     if (res.rowCount == 0) {
            //         return false
            //     }

            //     if (res.rows[0].clientid == args.clientid) {
            //         return true
            //     }

            //     return false

            // }).catch(e => {
            //     console.log(e)
            //     return false
            // })

            // if (!client_check) {
            //     return {
            //         success: false,
            //         msg: 'client id and ticket owner does not match'
            //     }
            // }

            // // now create lesson

            // console.log(incoming_time_string_to_postgres_epoch_time(args.starttime))
            // console.log(incoming_time_string_to_postgres_epoch_time(args.endtime))

            // let res = await pgclient.query('insert into pilates.lesson (clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) select $1, $2, to_timestamp($3), to_timestamp($4), $5 where not exists ( select * from pilates.lesson where (lesson.clientid=$1 or lesson.instructorid=$2) and ( tstzrange(to_timestamp($3), to_timestamp($4)) && tstzrange(lesson.starttime, lesson.endtime) ) and canceled_time is null )', [args.clientid, args.instructorid, incoming_time_string_to_postgres_epoch_time(args.starttime), incoming_time_string_to_postgres_epoch_time(args.endtime), args.ticketid]).then(res => {
            //     console.log(res)

            //     if (res.rowCount > 0) {
            //         return true
            //     }
            //     return false
            // }).catch(e => {
            //     console.log(e)
            //     return false
            // })


            // if (res) {
            //     return {
            //         success: true,

            //     }

            // }
            // else {
            //     return {
            //         success: false,
            //         msg: 'failed to create lesson. possibly time overlap'
            //     }
            // }

        },
        cancel_individual_lesson: async (parent, args) => {
            console.log('cancel_individual_lesson')

            console.log(args)

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
                let result = await pgclient.query(`select * from cancel_individual_lesson($1,$2,$3,$4) as (success bool, warning bool, msg text)`, [args.lessonid, args.clientid, args.reqtype, args.force_penalty])

                if (result.rowCount) {
                    throw {
                        detail: 'no rows affected'
                    }
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true,
                    warning: false
                }
            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                } catch { }

                return {
                    success: false,
                    warning: false,
                    msg: e.detail
                }
            }

            // let result = await pgclient.query(`select * from cancel_individual_lesson($1,$2,$3,$4) as (success bool, warning bool, msg text)`, [args.lessonid, args.clientid, args.reqtype, args.force_penalty]).then(res => {
            //     console.log(res)

            //     if (res.rowCount < 1) {
            //         return {
            //             success: false,
            //             warning: false,
            //             msg: 'no rows'
            //         }
            //     }
            //     else {
            //         return res.rows[0]
            //     }
            // }).catch(e => {
            //     console.log(e)
            //     return {
            //         success: false,
            //         warning: false,
            //         msg: 'query error'
            //     }
            // })

            // return result
        },

        change_lesson_overall: async (parent, args) => {

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

                console.log('change_lesson_overall')
                console.log(args)

                let res = await pgclient.query('BEGIN')


                // fetch at, gt of lesson
                res = await pgclient.query(`select activity_type, grouping_type, instructorid, starttime, endtime from lesson where id=$1 `, [args.lessonid])

                if (res.rows.length === 0) {
                    throw {
                        detail: 'no lesson found'
                    }
                }

                const activity_type = res.rows[0].activity_type
                const grouping_type = res.rows[0].grouping_type
                const existing_instructorid = res.rows[0].instructorid
                const existing_starttime = res.rows[0].starttime
                const existing_endtime = res.rows[0].endtime

                // check # of clients is acceptable for grouping type
                if (grouping_type === 'INDIVIDUAL' && args.client_tickets.length !== 1) {
                    throw {
                        detail: 'invalid client number for individual'
                    }
                }

                if (grouping_type === 'SEMI' && args.client_tickets.length !== 2) {
                    throw {
                        detail: 'invalid client number for semi'
                    }
                }

                if (grouping_type === 'GROUP' && args.client_tickets.length < 1) {
                    throw {
                        detail: 'invalid client number for group'
                    }
                }


                // check schedule overlap exist among instructor and clients

                // check instructor schedule
                res = await pgclient.query(`select * from lesson 
                where instructorid=$1 and id!=$2 and canceled_time is null 
                and (tstzrange($3, $4) && tstzrange(starttime, endtime) )
                `, [args.instructorid, args.lessonid, args.starttime, args.endtime])

                console.log(res)

                if (res.rows.length > 0) {
                    throw {
                        detail: 'instructor time overlap'
                    }
                }

                // check client schedule

                const client_id_arr = args.client_tickets.map(d => d.clientid)

                if (client_id_arr.length === 0) {
                    throw {
                        detail: 'no clients'
                    }
                }

                for (let i = 0; i < client_id_arr.length; i++) {
                    console.log(`checking for client id ${client_id_arr[i]}`)

                    res = await pgclient.query(`with A as (select * from lesson where canceled_time is null AND (tstzrange($3, $4) && tstzrange(starttime, endtime) )  AND id!=$2)

                    select B.ticketid from A 
                    left join (select distinct on(ticketid) * from assign_ticket where canceled_time is null order by ticketid, created desc) as B on B.lessonid = A.id
                    left join ticket on B.ticketid = ticket.id
                    left join plan on plan.id = ticket.creator_plan_id
                    where plan.clientid = $1`, [client_id_arr[i], args.lessonid, args.starttime, args.endtime])

                    console.log(res)

                    if (res.rows.length > 0) {
                        throw {
                            detail: 'client time overlap'
                        }
                    }
                }

                // detect if instructor change is required

                if (args.instructorid !== existing_instructorid) {
                    // assuming admin request update. iow, no penalty by directly updating the lesson row
                    await pgclient.query(`update lesson set instructorid=$1 where id=$2`, [args.instructorid, args.lessonid])

                }

                // detect if start end time update is required
                console.log(`existing starttime: ${existing_starttime}`)
                console.log(`existing endtime: ${existing_endtime}`)
                console.log(`incoming starttime: ${args.starttime}`)
                console.log(`incoming endtime: ${args.endtime}`)

                const existing_starttime_ms = (new Date(existing_starttime)).getTime()
                const incoming_starttime_ms = (new Date(args.starttime)).getTime()

                const existing_endtime_ms = (new Date(existing_endtime)).getTime()
                const incoming_endtime_ms = (new Date(args.endtime)).getTime()

                console.log(`existing_starttime_ms: ${existing_starttime_ms}`)
                console.log(`incoming_starttime_ms: ${incoming_starttime_ms}`)


                if (existing_endtime_ms !== incoming_starttime_ms || existing_endtime_ms !== incoming_endtime_ms) {
                    // assuming admin req update. iow, directly update lesson row
                    await pgclient.query(`update lesson set starttime=$1, endtime=$2 where id=$3`, [args.starttime, args.endtime, args.lessonid])
                }


                // handle ticket changes

                // gather existing assignments

                result = await pgclient.query(`with A as (select distinct on (ticketid) * from assign_ticket order by ticketid, created desc)
                select ticketid from A
                where lessonid=$1
                and canceled_time is null
                `, [args.lessonid])

                const existing_ticket_id_arr = result.rows.map(d => d.ticketid)

                console.log(`existing_ticket_id_arr: ${existing_ticket_id_arr}`)



                // gather incoming ticket id arr
                let incoming_ticket_id_arr = []
                for (let i = 0; i < args.client_tickets.length; i++) {
                    const tickets = args.client_tickets[i].tickets
                    console.log(tickets)
                    incoming_ticket_id_arr = incoming_ticket_id_arr.concat(tickets)

                }

                console.log(`incoming_ticket_id_arr: ${incoming_ticket_id_arr}`)

                // split to tickets to unassign  and tickets to newly create assignment

                const unassign_ticket_id_arr = existing_ticket_id_arr.filter(x => !incoming_ticket_id_arr.includes(x))
                const assign_ticket_id_arr = incoming_ticket_id_arr.filter(x => !existing_ticket_id_arr.includes(x))

                console.log(`unassign_ticket_id_arr: ${unassign_ticket_id_arr}`)
                console.log(`assign_ticket_id_arr: ${assign_ticket_id_arr}`)
                console.log(assign_ticket_id_arr.length)


                // execute unassignments
                for (let i = 0; i < unassign_ticket_id_arr.length; i++) {
                    const tid = unassign_ticket_id_arr[i]

                    // get assign id
                    res = await pgclient.query(`select distinct on(ticketid) id from assign_ticket where lessonid=$1 and ticketid=$2 order by ticketid, created desc`, [args.lessonid, tid])

                    const aid = res.rows[0].id

                    await pgclient.query(`update assign_ticket set canceled_time=now(), cancel_type='ADMIN' where id=$1`, [aid])
                }

                // execute creating assignments
                for (let i = 0; i < assign_ticket_id_arr.length; i++) {
                    const tid = assign_ticket_id_arr[i]

                    res = await pgclient.query(`insert into assign_ticket (ticketid,lessonid, created) values ($1,$2,now())`, [tid, args.lessonid])
                }


                await pgclient.query('COMMIT')
                pgclient.release()


                return {
                    success: true
                }

            } catch (e) {
                // console.trace(e)
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
        }

    }
}