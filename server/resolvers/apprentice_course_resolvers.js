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

        }
    },
    Mutation: {
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