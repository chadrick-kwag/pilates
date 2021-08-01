const pgclient = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_courses: async (parent, args) =>{
            console.log('fetch_apprentice_courses')

            try{
                let result = await pgclient.query(`select id,name from apprentice_course`)

                return {
                    success: true,
                    courses: result.rows
                }
            }
            catch(e){
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
            console.log('create_apprentice_course')
            console.log(args)

            try{
                await pgclient.query('begin')

                let result = await pgclient.query(`insert into apprentice_course (name) values ($1)`, [args.name])

                await pgclient.query('commit')

                return {
                    success: true
                }
            }
            catch(e){
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

        }
    }

}