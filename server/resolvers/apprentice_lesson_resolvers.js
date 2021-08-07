const { DateTime } = require('luxon')
const pgclient = require('../pgclient')


module.exports = {

    Query: {
        fetch_apprentice_lesson_by_lessonid: async (parent, args, context) => {

            try {

                await pgclient.query('begin')
                let result = await pgclient.query(`select apprentice_lesson.id, apprentice_lesson.starttime, apprentice_lesson.endtime, 
                apprentice_instructor.id as apprentice_instructor_id,
                person.name as apprentice_instructor_name,
                person.phonenumber as apprentice_instructor_phonenumber,
                apprentice_lesson.activity_type,
                apprentice_lesson.grouping_type
                from apprentice_lesson
                left join apprentice_instructor on apprentice_instructor.id = apprentice_lesson.apprentice_instructor_id
                left join person on person.id = apprentice_instructor.personid
                where apprentice_lesson.id = $1
                `, [args.lessonid])


                const lesson_info = result.rows[0]



                // fetch tickets
                result = await pgclient.query(`with A as (select distinct on(apprentice_ticket_id) * from assign_apprentice_ticket where
                apprentice_lesson_id = $1
                order by apprentice_ticket_id, created desc)
                
                select array_agg(A.apprentice_ticket_id) as ticket_id_arr from A
                where canceled_time is null
                `, [args.lessonid])


                const ticket_id_arr = result.rows[0].ticket_id_arr


                lesson_info.ticket_id_arr = ticket_id_arr



                await pgclient.query('commit')

                console.log(lesson_info)

                return {
                    success: true,
                    lesson: lesson_info
                }
            }
            catch (e) {
                console.log(e)
                return {
                    msg: e.detail,
                    success: false,
                }
            }

        }

    },
    Mutation: {
        update_apprentice_lesson_overall: async (parent, args, context) => {

            console.log('update_apprentice_lesson_overall:')
            console.log(args)

            try {
                await pgclient.query('begin')

                // check if new time slot is available

                const starttime = DateTime.fromHTTP(args.starttime)
                const endtime = starttime.plus({ hours: args.duration })

                console.log('starttime')
                console.log(starttime)

                console.log('endtime')
                console.log(endtime)

                const incoming_ticket_id_set = new Set(args.ticket_id_arr)

                console.log(incoming_ticket_id_set)

                // check overlapping apprentice lessons
                let result = await pgclient.query(`select * from apprentice_lesson where (tstzrange(apprentice_lesson.starttime, apprentice_lesson.endtime) && tstzrange($1, $2) ) and apprentice_lesson.id != $3 and apprentice_lesson.canceled_time is null`, [starttime, endtime, args.lessonid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'overlapping apprentice lesson exist'
                    }
                }

                // check tickets match duration
                if (args.duration !== incoming_ticket_id_set.size) {
                    throw {
                        detail: 'tickets count notmatch duration'
                    }
                }

                // update lesson time
                await pgclient.query(`update apprentice_lesson set starttime = $1, endtime = $2 where id=$3`, [starttime, endtime, args.lessonid])


                // ticket id reassigning stage.
                // get tickets to unassign, and tickets to newly assign


                // first get existing ticket id arr
                result = await pgclient.query(`with A as (select distinct on (apprentice_ticket_id) * from assign_apprentice_ticket where apprentice_lesson_id = $1 
                order by apprentice_ticket_id, created desc)
                
                
                select A.id, A.apprentice_ticket_id from A where canceled_time is null`, [args.lessonid])

                const existing_assign_info_arr = result.rows
                const existing_ticket_id_arr = result.rows.map(d => d.apprentice_ticket_id)
                const existing_ticket_id_set = new Set(existing_ticket_id_arr)

                const unassign_ticket_id_set = new Set()
                const new_assign_ticket_id_set = new Set()

                for (let elem of incoming_ticket_id_set) {
                    if (!existing_ticket_id_set.has(elem)) {
                        new_assign_ticket_id_set.add(elem)
                    }
                }

                for (let elem of existing_ticket_id_set) {
                    if (!incoming_ticket_id_set.has(elem)) {
                        unassign_ticket_id_set.add(elem)
                    }
                }

                console.log('unassign_ticket_id_set')
                console.log(unassign_ticket_id_set)

                console.log('existing_ticket_id_arr')
                console.log(existing_ticket_id_arr)

                // execute unassigning
                for (let tid of unassign_ticket_id_set) {
                    // get assign id
                    let aid = null
                    for (let a of existing_assign_info_arr) {
                        if (a.apprentice_ticket_id === tid) {
                            aid = a.id
                            break
                        }
                    }

                    if (aid === null) {
                        throw {
                            detail: `failed to get assign id of ticket id: ${tid}`
                        }
                    }
                    await pgclient.query(`update assign_apprentice_ticket set canceled_time = now(), cancel_type = 'ADMIN' where id=$1`, [aid])
                }


                // execute create assignments
                for (let tid of new_assign_ticket_id_set) {
                    await pgclient.query(`insert into assign_apprentice_ticket (apprentice_ticket_id, apprentice_lesson_id, created) values ($1, $2, now())`, [tid, args.lessonid])
                }

                await pgclient.query('commit')

                return {
                    success: true

                }
            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')
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
        create_apprentice_lesson: async (parent, args) => {
            try {

                console.log('create_apprentice_lesson')
                console.log(args)

                // construct endtime
                const endtime = new Date(args.starttime)
                endtime.setTime(endtime.getTime() + 1000 * 60 * 60 * args.hours)

                console.log('endtime')
                console.log(endtime)


                let res = await pgclient.query('BEGIN')





                // check no time overlapping lesson exists

                res = await pgclient.query(`select * from apprentice_lesson where apprentice_instructor_id=$1 AND 
                (tstzrange(starttime, endtime) && tstzrange($2, $3))
                AND canceled_time is null`, [args.apprentice_instructor_id, args.starttime, endtime])

                if (res.rows.length > 0) {
                    throw {
                        detail: 'overlapping lesson'
                    }
                }

                // check consistency of incoming appinstid, AT, GT
                res = await pgclient.query(`select * from apprentice_instructor_plan where apprentice_instructor_id=$1 and activity_type=$2 and grouping_type=$3 and id=$4`, [
                    args.apprentice_instructor_id, args.activity_type, args.grouping_type, args.plan_id
                ])

                console.log(res)

                if (res.rows.length !== 1) {
                    throw {
                        detail: 'inconsistentcy in given params'
                    }
                }

                // check free tickets with requested amount exist

                res = await pgclient.query(`select apprentice_ticket.id as id, 
                apprentice_ticket.expire_time
                from apprentice_ticket
                left join (select DISTINCT ON(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc) as A
                on A.apprentice_ticket_id = apprentice_ticket.id
                where apprentice_ticket.creator_plan_id = $1
                and (A.created is null OR (A.created is not null AND A.canceled_time is not null))
                and apprentice_ticket.expire_time > now()
                `, [args.plan_id])

                console.log(res)


                // check amount
                if (res.rows.length < args.hours) {
                    throw {
                        detail: 'no enough unconsumed tickets'
                    }
                }

                // select tickets to consume
                const consume_ticket_id_arr = []

                for (let i = 0; i < args.hours; i++) {
                    consume_ticket_id_arr.push(res.rows[i].id)
                }

                console.log(`consume_ticket_id_arr: ${consume_ticket_id_arr}`)

                // create lesson

                const starttime = args.starttime
                // const endtime = new Date(args.starttime)
                // endtime.setHours(endtime.getHours() + args.hours)

                // console.log(`endtime: ${endtime}`)

                res = await pgclient.query(`insert into apprentice_lesson (apprentice_instructor_id, starttime, endtime, created, activity_type, grouping_type) values ($1, $2, $3, now(), $4, $5) returning id`, [
                    args.apprentice_instructor_id, args.starttime, endtime, args.activity_type, args.grouping_type
                ])

                const created_lesson_id = res.rows[0].id

                console.log(`created_lesson_id: ${created_lesson_id}`)


                // insert to assign_apprentice_ticket

                for (let i = 0; i < consume_ticket_id_arr.length; i++) {
                    await pgclient.query(`insert into assign_apprentice_ticket (apprentice_ticket_id, apprentice_lesson_id, created) values ($1, $2, now())`, [
                        consume_ticket_id_arr[i], created_lesson_id
                    ])

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
        },
        change_apprentice_lesson_starttime: async (parent, args) => {
            try {
                console.log(args)

                let res = await pgclient.query('BEGIN')

                // get duration of lesson
                res = await pgclient.query(`select extract(epoch from endtime - starttime) as duration, endtime, apprentice_instructor_id from apprentice_lesson where id=$1`, [args.lessonid])

                if (res.rows.length !== 1) {
                    throw {
                        detail: 'no rows to change'
                    }
                }

                const duration = res.rows[0].duration
                const instid = res.rows[0].apprentice_instructor_id

                const starttime = new Date(args.starttime)
                const new_endtime = new Date(res.rows[0].endtime)
                const b = starttime.getTime() + duration * 1000

                new_endtime.setTime(b)

                // check if overlapping lessons exist
                res = await pgclient.query(`select * from apprentice_lesson where apprentice_instructor_id=$1 AND 
                (tstzrange(starttime, endtime) && tstzrange($2, $3))
                AND canceled_time is null
                `, [instid, args.starttime, new_endtime.toUTCString()])

                console.log('overlap check')
                console.log(res.rows)

                if (res.rows.length > 0) {
                    throw {
                        detail: 'overlappping lesson exists'
                    }
                }

                res = await pgclient.query(`update apprentice_lesson set starttime=$1, endtime=$2 where id=$3 returning id`, [
                    args.starttime, new_endtime.toUTCString(), args.lessonid
                ])

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
        },
        cancel_apprentice_lesson: async (parent, args) => {
            try {

                let res = await pgclient.query('BEGIN')

                // cancel lesson
                res = await pgclient.query(`update apprentice_lesson set canceled_time=now() where id=$1 returning id`, [args.lessonid])

                if (res.rows.length !== 1) {
                    throw {
                        detail: 'affected row not 1'
                    }
                }

                // cancel assign tickets. meaning, this cancel is no penalty cancel for instructor

                // fetch assignment ids
                res = await pgclient.query(`select id from assign_apprentice_ticket where apprentice_lesson_id=$1`, [args.lessonid])

                const assign_ids = res.rows.map(d => d.id)

                console.log('assign_ids')
                console.log(assign_ids)

                for (let i = 0; i < assign_ids.length; i++) {
                    res = await pgclient.query(`update assign_apprentice_ticket set canceled_time=now() where id=$1 `, [assign_ids[i]])
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