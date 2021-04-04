const pgclient = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_instructors: async (parent, args) =>{
            console.log('fetch_apprentice_instructors')

            let result = pgclient.query(`select apprentice_instructor.id as id,apprentice_instructor.name as name, phonenumber, apprentice_course.name as course_name, gender from apprentice_instructor left join apprentice_course on apprentice_instructor.course = apprentice_course.id`).then(
                res=>{

                    return {
                        success: true,
                        apprenticeInstructors: res.rows
                    }
                }
            ).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            })

            return result
        }
    },
    Mutation: {
        create_apprentice_instructor: async (parent, args) => {
            console.log('create_apprentice_instructor')
            console.log(args)

            let _args = [args.name, args.phonenumber, args.course_id, args.gender]
            console.log(_args)

            let result = pgclient.query(`insert into apprentice_instructor (name, phonenumber, course, gender) values ($1, $2, $3, $4)`, _args).then(
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
                    msg: e.detail
                }
            })

            return result
        }
    }

}