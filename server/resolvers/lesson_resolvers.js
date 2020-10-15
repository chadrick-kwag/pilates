
const pgclient  = require('../pgclient')

module.exports = {

    Query: {
        query_all_lessons: async (parent, args) => {

            let results = await pgclient.query("select  lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid").then(res => {
                return res.rows
            })
                .catch(e => [])

            let result = results[0]


            return results
        },
        
        query_lessons_with_daterange: async (parent, args) => {

            console.log("inside query_lessons_with_daterange")
            console.log(args)


            let start_time = new Date(args.start_time)
            let end_time = new Date(args.end_time)


            start_time = start_time.getTime() / 1000
            end_time = end_time.getTime() / 1000


            let results = await pgclient.query("select lesson.id as id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname,  client.phonenumber as client_phonenumber, instructor.name as instructorname, instructor.phonenumber as instructor_phonenumber from pilates.lesson \
            left join pilates.client on lesson.clientid=client.id \
            left join pilates.instructor on instructor.id=lesson.instructorid \
			where lesson.starttime > to_timestamp($1) and lesson.endtime < to_timestamp($2) and canceled_time is null", [start_time, end_time]).then(res => {

                return {
                    success: true,
                    lessons: res.rows
                }


            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"     
                }
            })


            return results


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

            let lessons = await pgclient.query("select lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid  where  lesson.clientid=$1 AND lesson.starttime >= to_timestamp($2) AND lesson.endtime <= to_timestamp($3) ", [clientid, start_time, end_time]).then(res => {
                console.log(res.rows)
                return res.rows
            }).catch(e => {
                console.log(e)
                return []
            })

            console.log(lessons)

            return lessons
        },
        query_lesson_with_timerange_by_instructorid: async (parent, args) => {
            console.log(args)

            let instructorid = args.instructorid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000

            let lessons = await pgclient.query("select lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid  where  lesson.instructorid=$1 AND lesson.starttime >= to_timestamp($2) AND lesson.endtime <= to_timestamp($3) ", [instructorid, start_time, end_time]).then(res => {
                return res.rows
            }).catch(e => {
                console.log(e)
                return null
            })

            if (lessons == null) {
                return {
                    success: false,
                    lessons: []
                }
            }
            else {
                return {
                    success: true,
                    lessons: lessons
                }
            }
        }
    },
    Mutation:{
        update_lesson_instructor_or_time: async (parent, args)=>{
            console.log('inside update lesson instructor or time')
            console.log(args)

            let result = await pgclient.query('select func1($1,$2,$3,$4)',[args.lessonid, args.instructor_id, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time)]).then(res=>{
                return res.rows[0].func1;
            })
            .catch(e=>{
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
            console.log(args)

            let _args = [args.clientid, args.instructorid, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time), args.ticketid]

            console.log(_args)

            let result = await pgclient.query("insert into pilates.lesson clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id values ($1, $2, $3, $4, $5) where not exists( \
                select 1 from pilates.lesson where  (clientid=$1 or instructorid=$2) \
                AND (tstzrange(to_timestamp($3), to_timestamp($4)) \
                     && tstzrange(lesson.starttime, lesson.endtime)) \
                     and predecessor_id is null \
                     ) and exists (select 1 from pilates.subscription_ticket where id=$5 and expire_time > now() and destroyer_subscription_id is not null)", _args).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return {
                        success: true

                    }
                }
                else {
                    return {
                        success: false,
                        msg: 'failed to insert query'
                    }
                }
            })
                .catch(e => {

                    console.log(e)
                    return {
                        success: false,
                        msg: "error query"
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
        delete_lesson_with_request_type: async (parent, args)=>{
            console.log('inside delete_lesson_with_request_type')

            console.log(args)

            let current_time = new Date()

            let request_type = args.request_type

            let lesson_start_time = await pgclient.query('select starttime from pilates.lesson where id=$1',[args.lessonid]).then(res=>{
                if(res.rowCount ==0){
                    return null
                }

                return res.rows[0].starttime
            }).catch(e=>{
                console.log(e)
                return null
            })

            if(lesson_start_time==null){
                return {
                    success: false,
                    msg: "failed to check start time of lesson"
                }
            }

            lesson_start_time = moment(lesson_start_time)

            console.log("current time")
            console.log(current_time)

            console.log("start time")
            console.log(lesson_start_time)



            let time_delta = lesson_start_time - current_time
            time_delta /= 1000   // convert to seconds

            console.log('time delta: ' + time_delta)

            // check if the current date is day before start time
            
            let start_time_zero_hour = moment(lesson_start_time)
            start_time_zero_hour.set({
                hours: 0
            })

            console.log("start_time_zero_hour")
            console.log(start_time_zero_hour)

            let is_current_date_before_start_time_date = current_time < start_time_zero_hour ? true: false

            console.log("is_current_date_before_start_time_date")
            console.log(is_current_date_before_start_time_date)

            if(request_type == "ADMIN_REQUEST"){



                let result = await pgclient.query('update pilates.lesson set cancel_type=\'ADMIN_CANCEL\', canceled_time=now() where id=$1',[ args.lessonid ]).then(res=>{
                    if(res.rowCount==0){
                        return {
                            success: false,
                            msg: "no lesson found matching lessonid"
                        }
                    }

                    return {
                        success: true
                    }
                })
                .catch(e=>{
                    console.log(e)

                    return {
                        success: false,
                        msg: "query error updating"
                    }
                })

                return result
            }
            else if(time_delta < 2 * 3600 ){
                return {
                    success: false,
                    msg: "minimum time window closed"
                }
            }
            else if(!is_current_date_before_start_time_date){
                return {
                    success: true,
                    msg: "penalized change"
                }
            }
            else{
                return {
                    success: true,
                    msg: "no penalized change"
                }
            }


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

            let res = await pgclient.query('insert into pilates.lesson (clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) select $1, $2, to_timestamp($3), to_timestamp($4), $5 where not exists ( select * from pilates.lesson where (lesson.clientid=$1 or lesson.instructorid=$2) and ( tstzrange(to_timestamp($3), to_timestamp($4)) && tstzrange(lesson.starttime, lesson.endtime) ) )', [args.clientid, args.instructorid, incoming_time_string_to_postgres_epoch_time(args.starttime), incoming_time_string_to_postgres_epoch_time(args.endtime), args.ticketid]).then(res => {
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

        }
    }
}