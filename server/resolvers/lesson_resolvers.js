const moment = require('moment-timezone');
const pgclient = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
} = require('./common')

module.exports = {

    Query: {
        query_lesson_detail_with_lessonid: async (parent, args) => {
            try {

                console.log('query_lesson_detail_with_lessonid')
                console.log(args)

                await pgclient.query('begin')

                const lessonid = args.lessonid

                let result = await pgclient.query(`select lesson.id as id, instructor.name as instructor_name, instructor.phonenumber as instructor_phonenumber, instructor.id as instructor_id, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type from lesson
                left join instructor on instructor.id = lesson.instructorid where lesson.id= $1 `, [lessonid])

                if (result.rows.length !== 1) {
                    throw {
                        detail: 'invalid lesson id'
                    }
                }

                const lesson_basic_info = result.rows[0]

                console.log('lesson_basic_info')
                console.log(lesson_basic_info)

                result = await pgclient.query(`select distinct on(ticketid) ticketid, client.id as clientid, client.name as client_name, client.phonenumber as client_phonenumber, plan.id as planid  from assign_ticket
                left join ticket on ticket.id = assign_ticket.ticketid
                left join plan on ticket.creator_plan_id = plan.id
                left join client on client.id = plan.clientid
                where canceled_time is null
                and lessonid = $1
                order by ticketid, assign_ticket.created desc  `, [lessonid])

                // convert to client-ticketid arr format
                let client_to_ticket_id_arr_map = {}
                let clientid_to_clientinfo_map = {}

                for (let i = 0; i < result.rows.length; i++) {
                    const item = result.rows[i]

                    const ticketid = item.ticketid
                    const clientid = item.clientid

                    let arr = client_to_ticket_id_arr_map[clientid]
                    if (arr === undefined || arr === null) {
                        client_to_ticket_id_arr_map[clientid] = [{
                            ticketid: ticketid
                        }]
                    }
                    else {
                        arr.push({
                            ticketid: ticketid
                        })
                    }


                    const a = clientid_to_clientinfo_map[clientid]
                    if (a === undefined) {
                        clientid_to_clientinfo_map[clientid] = {
                            clientid: clientid,
                            clientname: item.client_name,
                            clientphonenumber: item.client_phonenumber
                        }
                    }


                }

                console.log('client_to_ticket_id_arr_map')
                console.log(client_to_ticket_id_arr_map)

                const client_tickets = []

                for (let p in client_to_ticket_id_arr_map) {
                    let out = {}

                    out = { ...clientid_to_clientinfo_map[p] }

                    out.tickets = client_to_ticket_id_arr_map[p]

                    console.log('single client tickets item')
                    console.log(out)

                    client_tickets.push(out)
                }

                console.log('client_tickets')
                console.log(client_tickets)

                const detail = {
                    ...lesson_basic_info,
                    client_tickets: client_tickets
                }

                console.log('detail')
                console.log(detail)


                await pgclient.query(`commit`)

                return {
                    success: true,
                    detail: detail
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
        },
        query_all_lessons: async (parent, args) => {

            let results = await pgclient.query("select  lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid").then(res => {
                return res.rows
            })
                .catch(e => [])

            let result = results[0]


            return results
        },

        query_lessons_with_daterange: async (parent, args) => {

            console.log('query_lessons_with_daterange')
            console.log(args)

            try {
                let res = await pgclient.query('BEGIN')

                // gather normal lessons

                res = await pgclient.query(`select  lesson.id as indomain_id, instructor.id as instructorid,
                        instructor.name as instructorname, 
                        instructor.phonenumber as instructorphonenumber,
                        lesson.starttime, lesson.endtime,
                        lesson.activity_type,
                        lesson.grouping_type,
                        
                    
                        lesson.canceled_time as lesson_canceled_time,
                        
                        array_agg(json_build_object('clientname', client.name ,'clientid', client.id, 'clientphonenumber', client.phonenumber, 'ticketid', ticket.id )) as client_info_arr
                        from lesson 
                        inner join (select DISTINCT ON(ticketid) * from assign_ticket ORDER BY ticketid, created desc) AS A on lesson.id = A.lessonid
                        left join ticket on A.ticketid = ticket.id
                        left join plan on ticket.creator_plan_id = plan.id
                        left join client on plan.clientid = client.id
                        left join instructor on lesson.instructorid = instructor.id
                        where lesson.canceled_time is null
                        and A.canceled_time is null
                        AND (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1, $2) )
                            
                        GROUP BY lesson.id, instructor.id  `, [args.start_time, args.end_time])

                const normal_lessons = res.rows

                normal_lessons.forEach((d, i) => {
                    d['lesson_domain'] = 'normal_lesson'
                })

                console.log(`modified normal lessons: ${normal_lessons}`)

                // gather apprentice lessons

                res = await pgclient.query(`select apprentice_lesson.id as indomain_id,
                apprentice_lesson.apprentice_instructor_id as instructorid,
                apprentice_instructor.name as instructorname,
                apprentice_instructor.phonenumber as instructorphonenumber,
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
                where apprentice_lesson.canceled_time is null
                AND (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($1, $2) )
                
                
                group by apprentice_lesson.id, apprentice_instructor.id`, [args.start_time, args.end_time])

                console.log(res.rows)

                const apprentice_lessons = res.rows.filter(d => d.assigned_ticket_count > 0)

                console.log(`apprentice_lessons: ${apprentice_lessons}`)
                console.log(apprentice_lessons)

                // assign domain type 

                apprentice_lessons.forEach((d, i) => {
                    d['lesson_domain'] = 'apprentice_lesson'

                })

                console.log(`apprentice_lessons after adding domain info: ${apprentice_lessons}`)
                console.log(apprentice_lessons)

                await pgclient.query('COMMIT')

                const all_lessons = normal_lessons.concat(apprentice_lessons)

                all_lessons.forEach((d, i) => {
                    d['id'] = i
                })

                console.log(`all_lessons: ${all_lessons}`)
                console.log(all_lessons)

                return {
                    success: true,
                    lessons: all_lessons

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
                left join C on B.id = C.lessonid `, [clientid, start_time, end_time]).then(res => {
                console.log(res.rows)

                return {
                    success: true,
                    lessons: res.rows
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
        query_lesson_with_timerange_by_instructorid: async (parent, args) => {
            console.log(args)

            let instructorid = args.instructorid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000


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
                select * from B where valid_assign_exist is true `, [instructorid, start_time, end_time]).then(res => {
                return {
                    success: true,
                    lessons: res.rows
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
        query_lesson_data_of_instructorid: async (parent, args) => {
            console.log('query_lesson_data_of_instructorid')

            console.log(args)

            let _args = [args.instructorid, new Date(args.search_starttime), new Date(args.search_endtime)]

            console.log(_args)

            let result = await pgclient.query(`WITH C AS (select lesson.id as id, lesson.starttime, lesson.endtime, lesson.activity_type, lesson.grouping_type,
                lesson.canceled_time, lesson.cancel_type,
                array_agg(json_build_object('id', B.clientid, 'name', client.name )) filter(where B.clientid is not null) as client_info_arr, sum(case when B.percost is null then 0 else B.percost end) as netvalue
                from lesson 
                left join (select DISTINCT ON (ticketid) * from assign_ticket  order by ticketid, created desc) as A on A.lessonid = lesson.id
                left join (select ticket.id, plan.clientid as clientid, plan.totalcost / plan.rounds as percost from ticket left join plan on ticket.creator_plan_id = plan.id) as B on B.id = A.ticketid
                left join client on B.clientid = client.id
                where lesson.instructorid = $1
				and A.canceled_time is null
                and (lesson.cancel_type is null or lesson.cancel_type!='INSTRUCTOR_REQUEST') 
                and tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3)
                GROUP BY lesson.id)
                
                
                select * from C where client_info_arr is not null`, _args).then(res => {
                console.log(res)

                return {
                    success: true,
                    lesson_info_arr: res.rows
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log('result')
            console.log(result)

            return result
        }
    },
    Mutation: {
        update_lesson_instructor_or_time: async (parent, args) => {
            console.log('inside update lesson instructor or time')
            console.log(args)

            // if current time is after lesson's start time, then do not allow change at any circumstance
            let currdate = (new Date().getTime() / 1000)

            let lesson_startdate = parse_incoming_date_utc_string(args.start_time)
            let lesson_enddate = parse_incoming_date_utc_string(args.end_time)

            // todo: add check for update req time and lesson's start time and check if penalty is needed or not.

            if (lesson_startdate >= lesson_enddate) {
                return {
                    success: false,
                    msg: 'lesson start time is same or after end time'
                }
            }


            console.log([args.lessonid, args.instructor_id, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time)])

            let result = await pgclient.query('select * from change_lesson_time_or_instructor($1, $2 ,$3,$4) as (success bool, msg text)', [args.lessonid, args.instructor_id, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time)]).then(res => {
                console.log(res)
                if (res.rowCount > 0) {
                    return res.rows[0]
                }
                else {
                    return {
                        success: false,
                        msg: "query fail"
                    }
                }
            })
                .catch(e => {
                    console.log(e)

                    return {
                        success: false,
                        msg: 'query error'
                    }
                })

            console.log(result)

            return result
        },

        create_lesson: async (parent, args) => {
            console.log('inside create_lesson')
            console.log(args)

            if (args.ticketids.length === 0) {
                return {
                    success: false,
                    msg: "no clients given"
                }
            }


            let starttime = new Date(args.starttime).getTime() / 1000
            let endtime = new Date(args.endtime).getTime() / 1000

            let _args = [args.ticketids, args.instructorid, starttime, endtime]
            console.log(_args)

            let result = await pgclient.query('select success, msg from create_lesson($1,$2,$3,$4) as (success bool, msg text)', [args.ticketids, args.instructorid, starttime, endtime]).then(res => {
                console.log(res)

                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: 'rowcount not 1'
                    }
                }
                else {
                    return res.rows[0]
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

        delete_lesson: async (parent, args) => {
            console.log("delete_lesson")
            console.log(args)

            let lessonid = args.lessonid

            let ret = await pgclient.query("update pilates.lesson set cancel_type='BUFFERED_CLIENT_REQ_CANCEL', canceled_time=now() where id=$1", [lessonid]).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return {
                        success: true

                    }
                }

                return {
                    success: false,
                    msg: "query failed"
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })


            console.log(ret)

            return ret
        },
        attempt_update_lesson_time: async (parent, args) => {
            console.log(args)

            // first check if there are any colliding schedules
            // for checking collision, the instructor should not have overlapping timeslot
            // also, the client should not have overlapping timeslot as well.

            // get client id and instructor id of lessionid

            let info_res = await pgclient.query('select clientid, instructorid from pilates.lesson where id=$1', [args.lessonid]).then(res => {
                console.log('search client and instructor id info')
                console.log(res.rows)

                if (res.rowCount > 0) {
                    return res.rows[0]
                }
                else {
                    return null
                }
            }).catch(e => {
                console.log(e)
                return null
            })

            if (info_res == null) {
                // failed to get basic info of lesson id

                return {
                    success: false,
                    msg: "no lesson with lesson id found"
                }
            }

            let clientid = info_res.clientid
            let instructorid = info_res.instructorid


            let start_time = new Date(args.start_time).getTime() / 1000
            let end_time = new Date(args.end_time).getTime() / 1000



            let overlapping_lessons = await pgclient.query('select * from pilates.lesson where tstzrange(to_timestamp($1), to_timestamp($2)) && tstzrange(lesson.starttime, lesson.endtime) AND (clientid=$3 OR instructorid=$4) AND id!=$5 ', [start_time, end_time, clientid, instructorid, args.lessonid]).then(res => {

                // console.log("overlapping lesson search result")
                // console.log(res.rows)

                return res.rows
            })
                .catch(e => {
                    console.log(e)
                    return []
                })

            if (overlapping_lessons.length == 0) {
                // there are no overlapping lessons. it is okay to update the lesson

                let update_res = await pgclient.query('update pilates.lesson set starttime=to_timestamp($1), endtime=to_timestamp($2) where id=$3', [start_time, end_time, args.lessonid]).then(res => {
                    console.log('update row result')
                    console.log(res.rows)

                    if (res.rowCount > 0) {
                        return true
                    }
                    return false
                }).catch(e => {
                    console.log(e)
                    return false
                })

                if (update_res) {
                    return {
                        success: update_res
                    }
                }
                else {
                    // when failed
                    return {
                        success: update_res,
                        msg: "update operation failed"
                    }
                }

            }
            else {
                // there are overlapping lessons. return false

                return {
                    success: false,
                    msg: "overlapping lesson exist"
                }
            }


        },
        delete_lesson_with_request_type: async (parent, args) => {
            /* 
            success: Boolean
            warning: Boolean
            msg: String
            */

            console.log('delete_lesson_with_request_type')
            console.log(args)

            try {

                await pgclient.query(`begin`)

                // check lesson id is valid
                let result = await pgclient.query(`select id from lesson where id=$1`, [args.lessonid])

                if (result.rows.length !== 1) {

                    await pgclient.query('rollback')
                    return {
                        success: false,
                        msg: 'invalid lesson id'
                    }
                }

                // check request type
                // if req type is 'admin', then remove all ticket assignments, like they never existed
                // remove lesson too
                if (args.request_type === 'admin_req') {
                    // remove assign tickets
                    await pgclient.query(`delete from assign_ticket where lessonid=$1`, [args.lessonid])

                    // remove lesson
                    await pgclient.query(`delete from lesson where id=$1`, [args.lessonid])

                    await pgclient.query('commit')
                    return {
                        success: true
                    }
                }
                else if (args.request_type === 'instructor_req') {
                    // remove assign tickets which are alive

                    await pgclient.query(`delete from assign_ticket where lessonid=$1 and canceled_time is null`, [args.lessonid])

                    // do not remove lesson but populate cancel time wth cancel type
                    await pgclient.query(`update lesson set canceled_time=now(), cancel_type='INSTRUCTOR_REQUEST' where id=$1`, [args.lessonid])

                    await pgclient.query('commit')
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
                }
                catch (err) {
                    console.log(err)
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

            let result = await pgclient.query(`select * from cancel_lesson_with_reqtype($1, $2) as (success bool, msg text)`, [args.lessonid, args.request_type.toLowerCase()]).then(res => {
                console.log(res)

                if (res.rowCount !== 1) {
                    return {
                        success: false,
                        msg: 'rowcount not 1'
                    }
                }
                else {
                    return res.rows[0]
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
        create_individual_lesson: async (parent, args) => {
            console.log('inside create individual lesson')
            console.log(args)

            // check that ticket's owner matches given client id

            let client_check = await pgclient.query('select subscription.clientid from pilates.subscription_ticket left join pilates.subscription on subscription_ticket.creator_subscription_id=subscription.id where subscription_ticket.id=$1', [args.ticketid]).then(res => {
                console.log(res)

                if (res.rowCount == 0) {
                    return false
                }

                if (res.rows[0].clientid == args.clientid) {
                    return true
                }

                return false

            }).catch(e => {
                console.log(e)
                return false
            })

            if (!client_check) {
                return {
                    success: false,
                    msg: 'client id and ticket owner does not match'
                }
            }

            // now create lesson

            console.log(incoming_time_string_to_postgres_epoch_time(args.starttime))
            console.log(incoming_time_string_to_postgres_epoch_time(args.endtime))

            let res = await pgclient.query('insert into pilates.lesson (clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) select $1, $2, to_timestamp($3), to_timestamp($4), $5 where not exists ( select * from pilates.lesson where (lesson.clientid=$1 or lesson.instructorid=$2) and ( tstzrange(to_timestamp($3), to_timestamp($4)) && tstzrange(lesson.starttime, lesson.endtime) ) and canceled_time is null )', [args.clientid, args.instructorid, incoming_time_string_to_postgres_epoch_time(args.starttime), incoming_time_string_to_postgres_epoch_time(args.endtime), args.ticketid]).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }
                return false
            }).catch(e => {
                console.log(e)
                return false
            })


            if (res) {
                return {
                    success: true,

                }

            }
            else {
                return {
                    success: false,
                    msg: 'failed to create lesson. possibly time overlap'
                }
            }

        },
        cancel_individual_lesson: async (parent, args) => {
            console.log('cancel_individual_lesson')

            console.log(args)



            let result = await pgclient.query(`select * from cancel_individual_lesson($1,$2,$3,$4) as (success bool, warning bool, msg text)`, [args.lessonid, args.clientid, args.reqtype, args.force_penalty]).then(res => {
                console.log(res)

                if (res.rowCount < 1) {
                    return {
                        success: false,
                        warning: false,
                        msg: 'no rows'
                    }
                }
                else {
                    return res.rows[0]
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    warning: false,
                    msg: 'query error'
                }
            })

            return result
        },
        change_clients_of_lesson: async (parent, args) => {
            console.log('change_clients_of_lesson')
            console.log(args)

            try {
                await pgclient.query(`begin`)

                // divide tickets to assign and tickets to release

                let result = await pgclient.query(`select distinct on(ticketid) *  from assign_ticket
                where lessonid=$1
                order by ticketid, created desc`, [args.lessonid])

                let existing_assigned_ticket_id_arr = result.rows.map(d => d.ticketid)

                const new_tickets_to_assign_arr = []


                let existing_ticket_also_included_in_new_assignment_bool_arr = new Array(existing_assigned_ticket_id_arr.length).fill(false)

                for (let i = 0; i < args.ticketid_arr.length; i++) {
                    let exists = false;
                    for (let j = 0; j < existing_assigned_ticket_id_arr.length; j++) {
                        if (existing_assigned_ticket_id_arr[j] === args.ticketid_arr[i]) {
                            exists = true;
                            existing_ticket_also_included_in_new_assignment_bool_arr[j] = true;
                            break;
                        }

                    }

                    if (!exists) {
                        new_tickets_to_assign_arr.push(args.ticketid_arr[i])
                    }
                }

                let tickets_to_remove_arr = existing_ticket_also_included_in_new_assignment_bool_arr.map((d, i) => {
                    if (!d) {
                        return existing_assigned_ticket_id_arr[i]
                    }
                })



                // new tickets to assign, create assignment
                for (let i = 0; i < new_tickets_to_assign_arr.length; i++) {
                    await pgclient.query(`insert into assign_ticket (ticketid, lessonid, created) values ($1, $2, now())`, [new_tickets_to_assign_arr[i], args.lessonid])
                }


                // process assignment to remove. since we are assuming admin usage, no penalty removal
                // remove assign ment of ticket for this lesson
                for (let i = 0; i < tickets_to_remove_arr.length; i++) {
                    result = await pgclient.query(`select id from assign_ticket where ticketid=$1 and lessonid=$2`, [tickets_to_remove_arr[i], args.lessonid])


                    const id_arr = result.rows.map(d => d.id)

                    // execute remove
                    for (let i = 0; i < id_arr.length; i++) {
                        await pgclient.query(`delete from assign_ticket where id=$1`, [id_arr[i]])
                    }
                }



                await pgclient.query(`commit`)

                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                }
                catch (err) {
                    console.log(err)
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
        change_lesson_overall: async (parent, args) => {

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


                return {
                    success: true
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

    }
}