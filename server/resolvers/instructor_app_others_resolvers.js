
const { _pgclient, pool } = require('../pgclient')
const { DateTime } = require('luxon')

const { Query: query1 } = require('./apprentice_lesson_resolvers')

module.exports = {
    Query: {

        fetch_apprentice_lesson_info: async (parent, args, context) => {

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

            // check if query lesson is owned by current instructor
            try {
                let result = await pgclient.query(`select * from apprentice_lesson 
                left join apprentice_instructor  on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id 
                where apprentice_instructor.personid = $1 and apprentice_lesson.id = $2
                `, [instructor_personid, args.lessonid])

                if (result.rowCount < 1) {

                    pgclient.release()
                    return {
                        success: false,
                        msg: 'access denied'
                    }
                }
            }
            catch (e) {
                console.log(e)


                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }


            let result2 = await query1.fetch_apprentice_lesson_by_lessonid(null, args, null)

            console.log('result2')
            console.log(result2)

            return result2


        },

        fetch_available_apprentice_plans: async (parent, args, context) => {

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

                // gather plansA
                let result = await pgclient.query(`with A as (select distinct on(apprentice_ticket_id) * from assign_apprentice_ticket 
		   order by apprentice_ticket_id, created desc)
		   
select apprentice_instructor_plan.id as id, apprentice_instructor_plan.created, array_agg(json_build_object(
	'id', apprentice_ticket.id,
	'expire_time', apprentice_ticket.expire_time,
	'consumed_time', apprentice_lesson.starttime
)) as tickets,

count(case 
	 when apprentice_ticket.expire_time < now() then null
	  when B.id is not null then null
	  else true
	 end) as avail_count

from apprentice_ticket
left join (select * from A where A.canceled_time is null) as B on B.apprentice_ticket_id = apprentice_ticket.id
left join apprentice_lesson on apprentice_lesson.id = B.apprentice_lesson_id
left join apprentice_instructor_plan on apprentice_instructor_plan.id = apprentice_ticket.creator_plan_id
left join apprentice_instructor on apprentice_instructor.id = apprentice_instructor_plan.apprentice_instructor_id
left join person on person.id = apprentice_instructor.personid
where person.id = $1 and
 apprentice_instructor_plan.activity_type = $2 
 and apprentice_instructor_plan.grouping_type = $3
group by apprentice_instructor_plan.id, apprentice_instructor_plan.created`, [instructor_personid, args.activity_type, args.grouping_type])

                // remove plans which have no tickets
                let plans = result.rows.filter(x => x.avail_count > 0)


                pgclient.release()
                return {
                    success: true,
                    plans: plans
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

        delete_apprentice_lesson_from_instructor_app: async (parent, args, context) => {

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

                // check current instructor has access

                await pgclient.query('begin')

                let result = await pgclient.query(`select * from apprentice_lesson 
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id 
                where apprentice_lesson.id = $1 and apprentice_instructor.personid = $2
                `, [args.lessonid, instructor_personid])

                if (result.rowCount < 1) {
                    throw {
                        detail: 'access denied'
                    }
                }


                // releaset assigned tickets
                await pgclient.query(`with A as (select distinct on (apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc)
                    update assign_apprentice_ticket set canceled_time = now(), cancel_type = 'INSTRUCTOR_REQUEST' 
                    from (select * from A where A.apprentice_lesson_id = $1 and canceled_time is null) as B 
                    where assign_apprentice_ticket.id =B.id
                    
                `,[args.lessonid])


                // cancel lesson

                await pgclient.query(`update apprentice_lesson set canceled_time = now(), cancel_type = 'INSTRUCTOR_REQUEST', cancel_request_personid = $1
                , cancel_request_role = 'instructor'
                where id = $2 
                `, [instructor_personid, args.lessonid])



                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                } catch { }

                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },

        delete_normal_lesson_from_instructor_app: async (parent, args, context) => {

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
                // check lesson is owned by current instructor

                let result = await pgclient.query(`select * from lesson
                left join instructor on instructor.id = lesson.instructorid
                where instructor.personid = $1 and lesson.id = $2 
                `, [instructor_personid, args.lessonid])

                if (result.rowCount < 1) {
                    throw {
                        detail: 'access denied'
                    }
                }


                // check if students exist
                result = await pgclient.query(`with A as (select distinct on(ticketid) * from assign_ticket order by ticketid, created desc)
                select * from A
                where A.canceled_time is null
                and A.lessonid = $1

                `, [args.lessonid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'students exist'
                    }
                }


                // all pass. cancel lesson
                await pgclient.query(`update lesson set canceled_time=now(), cancel_request_personid=$1, cancel_request_role='instructor', cancel_type='INSTRUCTOR_REQUEST' where lesson.id=$2`, [instructor_personid, args.lessonid])


                await pgclient.query('commit')
                pgclient.release()
                return {
                    success: true
                }

            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                } catch { }

                pgclient.release()
                return {
                    success: false,
                    msg: e.detail
                }
            }

        },

        update_apprentice_lesson_start_time_from_instructor_app: async (parent, args, context) => {

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

                // check if lesson is owned by instructor

                await pgclient.query('begin')

                let result = await pgclient.query(`select starttime, endtime from apprentice_lesson 
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                where apprentice_lesson.id = $1 and apprentice_instructor.personid = $2
                `, [args.lessonid, instructor_personid])

                if (result.rowCount < 1) {
                    throw {
                        detail: 'access denied'
                    }
                }

                // calculate duration
                const st = result.rows[0].starttime
                const et = result.rows[0].endtime


                const st_dt = DateTime.fromJSDate(st)
                const et_dt = DateTime.fromJSDate(et)


                const duration = et_dt.diff(st_dt, 'hours').hours

                const new_st = DateTime.fromHTTP(args.start_time)
                const end_time = new_st.plus({
                    hours: duration
                })

                console.log('new end time')
                console.log(end_time)

                // check if overlapping apprentice lesson exist

                result = await pgclient.query(`select * from apprentice_lesson
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                where apprentice_lesson.id != $1
                and (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($2, $3))
                and apprentice_lesson.canceled_time is null
                and apprentice_instructor.personid = $4
                `, [args.lessonid, args.start_time, end_time, instructor_personid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping apprentice lesson exist'
                    }
                }


                // check if overlapping normal lesson exist
                result = await pgclient.query(`select * from lesson
                left join instructor on instructor.id = lesson.instructorid
                where lesson.canceled_time is null
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($1, $2))
                and instructor.personid = $3
                `, [args.start_time, end_time, instructor_personid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping normal lesson exist'
                    }
                }


                // update time of lesson
                await pgclient.query(`update apprentice_lesson set starttime=$1, endtime=$2 where apprentice_lesson.id = $3`, [args.start_time, end_time, args.lessonid])

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                } catch { }

                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },

        update_normal_lesson_from_instructor_app: async (parent, args, context) => {

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
            // prepare endtime
            let start_time = DateTime.fromHTTP(args.start_time)
            const end_time = start_time.plus({ hours: args.duration })

            try {

                // check lesson is owned by current instructor

                let result = await pgclient.query(`select * from lesson left join instructor on instructor.id = lesson.instructorid
                where lesson.id = $1 and instructor.personid = $2
                `, [args.lessonid, instructor_personid])

                if (result.rowCount < 1) {
                    throw {
                        detail: 'access denied'
                    }
                }

                // check if any students exist
                result = await pgclient.query(`with A as (select distinct on (ticketid) * from assign_ticket order by ticketid, created desc)
                    select * from A where canceled_time is null and lessonid = $1
                `, [args.lessonid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'student exist. edit denied'
                    }
                }


                // check if time overlapping other normal lesson exist. take 'no student' lessons into consideration
                result = await pgclient.query(`select * from lesson 
                left join instructor on instructor.id = lesson.instructorid
                where instructor.personid=$1 
                
                and (tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3)) 
                and lesson.id != $4
                and lesson.canceled_time is null
                `, [instructor_personid, args.start_time, end_time, args.lessonid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping normal lesson exist'
                    }
                }

                // check any overlapping apprentice lessons exist.
                result = await pgclient.query(`select * from apprentice_lesson
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                where apprentice_instructor.personid = $1
                and (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($2, $3)) 
                and apprentice_lesson.canceled_time is null
                `, [instructor_personid, args.start_time, end_time])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping apprentice lesson exist'
                    }
                }


                // update lesson info
                await pgclient.query(`update lesson set starttime=$1, endtime=$2, activity_type=$3, grouping_type=$4 where lesson.id = $5`, [args.start_time, end_time, args.activity_type, args.grouping_type, args.lessonid])

                await pgclient.query('commit')

                pgclient.release()

                return {
                    success: true
                }


            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                } catch {

                }

                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },


        create_normal_lesson_from_instructor_app: async (parent, args, context) => {

            console.log('create_normal_lesson_from_instructor_app')
            console.log(args)

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


            // prepare endtime
            let start_time = DateTime.fromHTTP(args.start_time)
            const end_time = start_time.plus({ hours: args.duration })

            try {
                await pgclient.query('begin')
                let result = await pgclient.query(`
                    select lesson.id, lesson.starttime, lesson.endtime from lesson
                    left join instructor on lesson.instructorid = instructor.id
                    where lesson.canceled_time is null
                    and instructor.personid = $1
                    and ( tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3))
                    `, [instructor_personid, args.start_time, end_time])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping lesson exist'
                    }
                }

                // fetch instructor id
                result = await pgclient.query(`select id from instructor where personid=$1`, [instructor_personid])

                const instructor_id = result.rows[0].id

                // create normal lesson
                await pgclient.query(`insert into lesson (instructorid, starttime, endtime, created, activity_type, grouping_type)
                    values ($1, $2, $3, now(), $4, $5) 
                    `, [instructor_id, args.start_time, end_time, args.activity_type, args.grouping_type])
                // 
                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
                } catch { }

                pgclient.release()

                return {
                    sucess: false,
                    msg: e.detail
                }
            }



        },

        create_apprentice_lesson_from_instructor_app: async (parent, args, context) => {
            console.log('create_apprentice_lesson_from_instructor_app')



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

            // check duration count and ticket count match
            if (args.duration !== args.ticket_ids.length) {
                return {
                    success: false,
                    msg: 'duration and ticket count not match'
                }
            }


            // prepare endtime
            let start_time = DateTime.fromHTTP(args.start_time)
            const end_time = start_time.plus({ hours: args.duration })

            console.log(`end_time: ${end_time}`)

            try {
                // 
                result = await pgclient.query(`select * from apprentice_instructor where personid = $1`, [instructor_personid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'instructor cannot create apprentice lesson'
                    }
                }

                // check if tickets are owned by current instructor
                for (let i = 0; i < args.ticket_ids.length; i++) {
                    const tid = args.ticket_ids[i]

                    result = await pgclient.query(`select * from apprentice_ticket
                    left join apprentice_instructor_plan on apprentice_instructor_plan.id = apprentice_ticket.creator_plan_id
                    left join apprentice_instructor on apprentice_instructor.id = apprentice_instructor_plan.apprentice_instructor_id
                    left join person on person.id = apprentice_instructor.personid
                    where person.id = $1 and apprentice_ticket.id = $2
                    `, [instructor_personid, tid])

                    if (result.rowCount !== 1) {
                        throw {
                            detail: 'ticket not owned by instructor'
                        }
                    }
                }

                // check if overlapping apprentice lesson exist

                result = await pgclient.query(`select * from apprentice_lesson 
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                where
                canceled_time is null
                and apprentice_instructor.personid = $1
                and (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($2, $3))
                `, [instructor_personid, args.start_time, end_time])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping lesson exist'
                    }
                }

                // fetch apprentice instructor id
                result = await pgclient.query(`select id from apprentice_instructor where personid = $1`, [instructor_personid])

                const apprentice_instructor_id = result.rows[0].id

                // create apprentice lesson
                result = await pgclient.query(`insert into apprentice_lesson (apprentice_instructor_id, starttime, endtime, created, activity_type, grouping_type) values ($1, $2, $3, now(), $4, $5) returning id`, [apprentice_instructor_id, args.start_time, end_time, args.activity_type, args.grouping_type])


                const created_lesson_id = result.rows[0].id

                // assign tickets to created lesson
                for (let i = 0; i < args.ticket_ids.length; i++) {
                    const tid = args.ticket_ids[i]

                    await pgclient.query(`insert into assign_apprentice_ticket (apprentice_ticket_id, apprentice_lesson_id, created ) values ($1, $2, now())`, [
                        tid, created_lesson_id
                    ])
                }


                pgclient.query('commit')

                pgclient.release()

                return {
                    success: true
                }

            }
            catch (e) {
                console.log(e)

                await pgclient.query('rollback')
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },
        create_lesson_from_instructor_app: async (parent, args, context) => {

            console.log('create_lesson_from_instructor_app')
            console.log(args)

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

            // prepare endtime
            let start_time = DateTime.fromHTTP(args.start_time)
            const end_time = start_time.plus({ hours: args.duration })

            console.log(`end_time: ${end_time}`)


            try {
                await pgclient.query('begin')

                // check if lesson type is creatable by instructor
                let result
                if (args.lesson_type === 'normal_lesson') {
                    // check if time overlapping lesson exist

                    result = await pgclient.query(`
                    select lesson.id, lesson.starttime, lesson.endtime from lesson
                    left join instructor on lesson.instructorid = instructor.id
                    where lesson.canceled_time is null
                    and instructor.personid = $1
                    and ( tstzrange(lesson.starttime, lesson.endtime) && tstzrange($2, $3))
                    `, [instructor_personid, args.start_time, end_time])

                    if (result.rowCount > 0) {
                        throw {
                            detail: 'overlapping lesson exist'
                        }
                    }

                    // fetch instructor id
                    result = await pgclient.query(`select id from instructor where personid=$1`, [instructor_personid])

                    const instructor_id = result.rows[0].id


                    await pgclient.query(`insert into lesson (instructorid, starttime, endtime, created, activity_type, grouping_type)
                    values ($1, $2, $3, now(), $4, $5) 
                    `, [instructor_id, args.start_time, end_time, args.activity_type, args.grouping_type])


                }
                else if (args.lesson_type === 'apprentice_lesson') {
                    // check if instructor can create apprentice lesson
                    result = await pgclient.query(`select * from apprentice_instructor where personid = $1`, [instructor_personid])

                    if (result.rowCount !== 1) {
                        throw {
                            detail: 'instructor cannot create apprentice lesson'
                        }
                    }

                    // check if overlapping apprentice lesson exist

                    result = await pgclient.query(`select * from apprentice_lesson 
                    left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                    where
                    canceled_time is null
                    and apprentice_instructor.personid = $1
                    and (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($2, $3))
                    `, [instructor_personid, args.start_time, end_time])

                    if (result.rowCount > 0) {
                        throw {
                            detail: 'overlapping lesson exist'
                        }
                    }

                    // fetch apprentice instructor id
                    result = await pgclient.query(`select id from apprentice_instructor where personid = $1`, [instructor_personid])

                    const apprentice_instructor_id = result.rows[0].id

                    result = await pgclient.query(`insert into apprentice_lesson (apprentice_instructor_id, starttime, endtime, created, activity_type, grouping_type) values ($1, $2, $3, now(), $4, $5)`, [apprentice_instructor_id, args.start_time, end_time, args.activity_type, args.grouping_type])


                }

                else if (args.lesson_type === 'master_lesson') {
                    result = await pgclient.query(`select allow_teach_apprentice from insructor where personid = $1`, [instructor_personid])

                    if (result.rowCount !== 1) {
                        throw {
                            detail: 'instructor not exist'
                        }
                    }

                    if (result.rows[0].allow_teach_apprentice !== true) {
                        throw {
                            detail: 'instructor cannot create master lesson'
                        }
                    }

                    throw {
                        detail: 'not implemented'
                    }
                }
                result = await pgclient.query(``)


                await pgclient.query('commit')

                pgclient.release()

                return {
                    success: true
                }
            } catch (e) {

                console.log(e)

                try {

                    await pgclient.query('rollback')
                } catch { }
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }
        }
    }
}