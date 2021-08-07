const { _pgclient, pool } = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_instructors: async (parent, args) => {


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
                let result = await pgclient.query(`select apprentice_instructor.id as id,person.name as name, person.phonenumber, apprentice_course.name as course_name, person.gender from apprentice_instructor 
                left join apprentice_course on apprentice_instructor.course = apprentice_course.id
                left join person on person.id = apprentice_instructor.personid
                `)

                pgclient.release()

                return {
                    success: true,
                    apprenticeInstructors: result.rows
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

        },
        query_apprentice_instructor_by_name: async (parent, args) => {


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
                let result = await pgclient.query(`select apprentice_instructor.id, person.name, person.phonenumber, person.gender from apprentice_instructor
                left join person on person.id = apprentice_instructor.personid where person.name=$1`, [args.name])

                pgclient.release()

                return {
                    success: true,
                    apprenticeInstructors: result.rows
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

        },
        fetch_apprentice_instructor_by_id: async (parent, args) => {


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
                let result = await pgclient.query(`select apprentice_instructor.id, person.name, person.phonenumber, person.gender, 
                apprentice_course.name as course_name, apprentice_course.id as course_id
                from apprentice_instructor
                left join apprentice_course on apprentice_course.id = apprentice_instructor.course
                left join person on person.id = apprentice_instructor.personid
                where apprentice_instructor.id=$1
                `, [args.id])

                pgclient.release()

                return {
                    success: true,
                    apprenticeInstructors: result.rows
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


        }
    },
    Mutation: {
        create_apprentice_instructor: async (parent, args) => {
            console.log('create_apprentice_instructor')
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

                // check if person exists

                let result = await pgclient.query(`select id from person where name=$1 and phonenumber=$2`, [args.name, args.phonenumber])

                let personid
                if (result.rowCount > 0) {
                    personid = result.rows[0].id
                }
                else {
                    result = await pgclient.query('insert into person (name, phonenumber, gender) values ($1, $2, $3) returning id', [args.name, args.phonenumber, args.gender])


                    personid = result.rows[0].id
                }

                // create apprentice instructor
                result = await pgclient.query(`insert into apprentice_instructor (course, personid) values ($1, $2)`, [args.course_id, personid])


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
        update_apprentice_instructor: async (parent, args) => {



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

                // update apprentice instructor
                let result = await pgclient.query(`update apprentice_instructor set course=$1 where id=$2 returning personid`, [args.course_id, args.id])

                let personid = result.rows[0].personid

                result = await pgclient.query(`update person set name=$1, phonenumber=$2, gender=$3 where id=$4`, [args.name, args.phonenumber, args.gender, personid])


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

        }
    }

}