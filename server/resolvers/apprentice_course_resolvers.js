const { pool, _pgclient } = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_courses: async (parent, args) => {
            console.log('fetch_apprentice_courses')

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: 'db connect fail'
                }
            }


            try {
                let result = await pgclient.query(`select id,name from apprentice_course`)

                pgclient.release()

                return {
                    success: true,
                    courses: result.rows
                }
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        fetch_apprentice_course_info: async (parent, args, context) => {
            console.log('fetch_apprentice_course_info')
            console.log(args)

            let pgclient
            try {
                pgclient = await pool.connect()
            }
            catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: 'db connect fail'
                }
            }

            try {
                let result = await pgclient.query(`select id, name from apprentice_course where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no plan found'
                    }
                }
                pgclient.release()

                return {
                    success: true,
                    course: result.rows[0]
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
        update_apprentice_course: async (parent, args, context) => {
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
                let result = await pgclient.query(`update apprentice_course set name=$1 where id=$2`, [args.name, args.id])


                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no courses affected'
                    }
                }


                pgclient.release()
                return {
                    success: true
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
        create_apprentice_course: async (parent, args) => {

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

                let result = await pgclient.query(`insert into apprentice_course (name) values ($1)`, [args.name])

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