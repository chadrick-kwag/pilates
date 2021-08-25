const { pool } = require('../pgclient')

module.exports = {
    Query: {
        fetch_master_instructors: async (parent, args, context) => {

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
                let result = await pgclient.query(`select master_instructor.id, person.name, person.phonenumber, person.email, person.gender,
                master_instructor.created from master_instructor
                left join person on person.id = master_instructor.personid
                `)
                pgclient.release()
                return {
                    success: true,
                    instructors: result.rows
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
    }
}