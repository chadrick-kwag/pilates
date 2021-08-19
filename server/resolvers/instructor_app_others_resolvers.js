
const { _pgclient, pool } = require('../pgclient')
const {DateTime} = require('luxon')

module.exports = {
    Mutation: {
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
            const end_time = start_time.plus({hours: args.duration})

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