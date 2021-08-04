const pgclient = require('../pgclient')

module.exports = {
    Query: {
        fetch_master_instructors: async (parent, args, context) => {


            try {
                let result = await pgclient.query(`select master_instructor.id, person.name, person.phonenumber, person.email, person.gender,
                master_instructor.created from master_instructor
                left join person on person.id = master_instructor.personid
                `)

                return {
                    success: true,
                    instructors: result.rows
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
    }
}