const pgclient = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_courses: async (parent, args) =>{
            console.log('fetch_apprentice_courses')

            let result = pgclient.query(`select id,name from apprentice_course`).then(
                res=>{
                    return {
                        success: true,
                        courses: res.rows
                    }
                }
            ).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: e.details
                }
            })

            return result
        }
    },
    Mutation: {
        create_apprentice_course: async (parent, args) => {
            console.log('create_apprentice_course')
            console.log(args)

            let result = pgclient.query(`insert into apprentice_course (name) values ($1)`, [args.name]).then(
                res=>{
                    if(res.rowCount===1){
                        return {
                            success: true
                        }
                    }
                    else{
                        return {
                            success: false,
                            msg: "rowcount not 1"
                        }
                    }
                }
            ).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: e.details
                }
            })

            return result
        }
    }

}