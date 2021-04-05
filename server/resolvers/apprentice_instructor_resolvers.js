const pgclient = require('../pgclient')



module.exports = {

    Query: {
        fetch_apprentice_instructors: async (parent, args) => {
            console.log('fetch_apprentice_instructors')

            let result = pgclient.query(`select apprentice_instructor.id as id,apprentice_instructor.name as name, phonenumber, apprentice_course.name as course_name, gender from apprentice_instructor left join apprentice_course on apprentice_instructor.course = apprentice_course.id`).then(
                res => {

                    return {
                        success: true,
                        apprenticeInstructors: res.rows
                    }
                }
            ).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            })

            return result
        },
        query_apprentice_instructor_by_name: async (parent, args) => {
            let result = await pgclient.query(`select array_agg(json_build_object('id', id,
            'phonenumber', phonenumber,
            'name', name,
            'gender', gender
           )) as data from apprentice_instructor where name=$1`, [args.name]).then(res => {
                console.log(res.rows)
                return {
                    success: true,
                    apprenticeInstructors: res.rows[0].data
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log(result)

            return result
        },
        fetch_apprentice_instructor_by_id: async (parent, args) => {
            let result = await pgclient.query(`select array_agg(json_build_object('id', apprentice_instructor.id,
            'phonenumber', phonenumber,
            'name', apprentice_instructor.name,
            'gender', gender,
            'course_name', apprentice_course.name,
            'course_id', apprentice_course.id
           )) as data from apprentice_instructor left join apprentice_course on apprentice_course.id = apprentice_instructor.course where apprentice_instructor.id=$1`, [args.id]).then(res => {
                return {
                    success: true,
                    apprenticeInstructors: res.rows[0].data
                }
            }).catch(e => {
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
                res => {
                    if (res.rowCount === 1) {
                        return {
                            success: true
                        }
                    }
                    else {
                        return {
                            success: false,
                            msg: "rowcount not 1"
                        }
                    }
                }
            ).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            })

            return result
        },
        update_apprentice_instructor: async (parent, args) => {

            console.log('update_apprentice_instructor')

            let _args = [
                args.name, args.phonenumber, args.course_id, args.gender, args.id
            ]

            console.log(_args)

            let result = await pgclient.query(`update apprentice_instructor set name=$1, phonenumber=$2, course=$3, gender=$4 where id=$5`, _args).then(res => {
                return {
                    success: true
                }
            }).catch(e => {
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