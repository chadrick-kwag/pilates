const pgclient = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time,
    ensure_admin_account_id_in_context
} = require('./common')

module.exports = {
    Query: {

        fetch_instructor_stat: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }

            try {
                let result = await pgclient.query(`select count(1) as totalcount from instructor`)

                return {
                    success: true,
                    stat: {
                        total_count: result.rows[0].totalcount
                    }
                }
            }
            catch (err) {
                return {
                    success: false,
                    msg: err.detail
                }
            }
        },

        fetch_instructors: async (parent, args, context) => {

            console.log(context)
            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }

            try {
                let result = await pgclient.query(`select instructor.id as id,
                person.name as name,
                person.phonenumber as phonenumber, 
                person.created, is_apprentice, birthdate, validation_date, memo, job, address, person.email, person.gender, level, instructor_level.level_string as level_string, disabled from instructor
                left join person on person.id = instructor.personid
                left join instructor_level on level=instructor_level.id
                `)

                return {
                    success: true,
                    instructors: result.rows
                }
            }
            catch (e) {
                console.log(e)

                return {
                    success: false
                }
            }
        },

        search_instructor_with_name: async (parent, args, context, info) => {



            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }


            try {
                let results = await pgclient.query(`select instructor.*,
                person.name,
                person.phonenumber,
                person.gender,
                person.email,
                person.created
                 from instructor 
                left join person on person.id = instructor.personid
                where person.name=$1`, [args.name])

                return results.rows
            }
            catch (e) {
                console.log(e)

                return []
            }

        },

        fetch_instructor_with_id: async (parent, args, context) => {



            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }



            try {

                let result = await pgclient.query(`select instructor.id as id, person.name, person.phonenumber, person.created, is_apprentice, birthdate, validation_date, memo, job, address, person.email, person.gender, level, instructor_level.level_string as level_string, disabled, allow_teach_apprentice from instructor 
                left join instructor_level on level = instructor_level.id 
                left join person on person.id = instructor.personid
                where instructor.id=$1`, [args.id])

                return {
                    success: true,
                    instructor: result.rows[0]
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
        fetch_instructor_level_info: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }

            try {
                let result = await pgclient.query(`select id, rank, level_string, active, non_group_lesson_pay_percentage::float, group_lesson_perhour_payment, group_lesson_perhour_penalized_payment from instructor_level`)

                return {
                    success: true,
                    info_list: result.rows
                }

            }
            catch (err) {
                return {
                    success: false,
                    msg: err.detail
                }
            }
        }
    },
    Mutation: {

        create_instructor: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }

            try {
                // check if exist in person
                await pgclient.query('begin')

                let result = await pgclient.query(`select id from person where name=$1 and phonenumber=$2`, [args.name, args.phonenumber])

                let personid
                if (result.rowCount === 0) {

                    let _gender = null
                    if (args.gender.toLowerCase() === 'male') {
                        _gender = 'MALE'
                    }
                    else if (args.gender.toLowerCase() === 'female') {
                        _gender = 'FEMALE'
                    }

                    result = await pgclient.query(`insert into person (name, phonenumber, gender, email) values ($1, $2, $3, $4) returning id`, [args.name, args.phonenumber, _gender, args.email])

                    personid = result.rows[0].id


                }
                else {
                    personid = result.rows[0].id
                }

                // create instructor
                result = await pgclient.query(`insert into instructor(birthdate, address, job, validation_date, level, memo, personid) values ($1, $2, $3, $4, $5, $6, $7)`, [args.birthdate, args.address, args.job, args.validation_date, args.level, args.memo, personid])

                await pgclient.query('commit')

                return {
                    success: true
                }
            }
            catch (e) {
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

        },
        deleteinstructor: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }


            try {
                let result = await pgclient.query('delete from instructor where id=$1', [args.id])

                return {
                    success: true
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
        update_instructor: async (parent, args, context) => {



            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'not admin'
                }
            }

            try {

                await pgclient.query('begin')

                // update instructor info first

                let result = await pgclient.query(`update instructor set level=$1, address=$2, validation_date=$3, birthdate=$4, memo=$5, is_apprentice=$6, job=$7, allow_teach_apprentice=$8 where id=$9 returning personid`, [args.level, args.address, args.validation_date, args.birthdate, args.memo, args.is_apprentice, args.job, args.allow_teach_apprentice, args.id])


                const personid = result.rows[0].personid


                result = await pgclient.query(`update person set name=$1, phonenumber=$2, gender=$3, email=$4 where id=$5`, [args.name, args.phonenumber, args.gender, args.email, personid])


                await pgclient.query('commit')

                return {
                    success: true
                }



            } catch (e) {
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

            // let validation_date = args.validation_date
            // if (validation_date !== null) {
            //     validation_date = incoming_time_string_to_postgres_epoch_time(validation_date)
            // }

            // let birthdate = args.birthdate
            // if (birthdate !== null) {
            //     birthdate = incoming_time_string_to_postgres_epoch_time(birthdate)
            // }

            // let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.level, args.address, validation_date, birthdate, args.memo, args.is_apprentice, args.job, args.allow_teach_apprentice, args.id]

            // console.log(_args)

            // let ret = await pgclient.query('update instructor set name=$1, phonenumber=$2, gender=$3, email=$4, level=$5, address=$6, validation_date=to_timestamp($7), birthdate=to_timestamp($8), memo=$9, is_apprentice=$10, job=$11, allow_teach_apprentice=$12 where id=$13', _args).then(res => {
            //     if (res.rowCount > 0) {
            //         return {
            //             success: true
            //         }
            //     }
            //     return {
            //         success: false,
            //         msg: 'no instructor updated'
            //     }
            // }).catch(e => {
            //     console.log(e)
            //     return {
            //         success: true,
            //         msg: 'error updating instructor'
            //     }
            // })


            // return ret
        },
        disable_instructor_by_id: async (parent, args) => {
            let result = await pgclient.query('update instructor set disabled=true where id=$1', [args.id]).then(res => {
                if (res.rowCount == 1) {
                    return {
                        success: true
                    }
                }
                else {
                    return {
                        success: false,
                        msg: "row count not 1"
                    }
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        },
        able_instructor_by_id: async (parent, args) => {
            let result = await pgclient.query('update instructor set disabled=false where id=$1', [args.id]).then(res => {
                if (res.rowCount == 1) {
                    return {
                        success: true
                    }
                }
                else {
                    return {
                        success: false,
                        msg: "row count not 1"
                    }
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        },
        update_instructor_level: async (parent, args) => {
            try {
                console.log('update_instructor_level')
                console.log(args)

                // check arg values
                if (args.non_group_lesson_pay_percentage < 0 || args.non_group_lesson_pay_percentage > 1) {
                    return {
                        success: false,
                        msg: 'invalid non_group_lesson_pay_percentage value'
                    }
                }

                if (args.group_lesson_perhour_payment < 0) {
                    return {
                        success: false,
                        msg: 'invalid group_lesson_perhour_payment value'
                    }
                }

                if (args.group_lesson_perhour_penalized_payment < 0) {
                    return {
                        success: false,
                        msg: 'invalid group_lesson_perhour_penalized_payment value'
                    }
                }


                await pgclient.query('begin')

                let result = await pgclient.query(`update instructor_level set level_string=$2, active=$3,
                non_group_lesson_pay_percentage=$4, group_lesson_perhour_payment=$5, group_lesson_perhour_penalized_payment=$6, rank=$7
                  where id=$1`, [args.id, args.level_string, args.active, args.non_group_lesson_pay_percentage, args.group_lesson_perhour_payment, args.group_lesson_perhour_penalized_payment, args.rank])

                await pgclient.query(`commit`)

                return {
                    success: true
                }
            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                }
                catch (err) {
                    console.log(err)
                    return {
                        success: false,
                        msg: err.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        add_instructor_level: async (parent, args) => {

            // check args

            if (args.non_group_lesson_pay_percentage < 0 || args.non_group_lesson_pay_percentage > 1) {
                return {
                    success: false,
                    msg: 'invalid value for non_group_lesson_pay_percentage'
                }
            }

            if (args.group_lesson_perhour_payment < 0) {
                return {
                    success: false,
                    msg: 'invalid value for group_lesson_perhour_payment'
                }
            }

            if (args.group_lesson_perhour_penalized_payment < 0) {
                return {
                    success: false,
                    msg: 'invalid value for group_lesson_perhour_penalized_payment'
                }
            }

            try {

                await pgclient.query('begin')

                let result = await pgclient.query(`insert into instructor_level (level_string, active, non_group_lesson_pay_percentage, group_lesson_perhour_payment, group_lesson_perhour_penalized_payment, rank) values ($1, $2, $3, $4, $5, $6) returning id`, [args.level_string, args.active, args.non_group_lesson_pay_percentage, args.group_lesson_perhour_payment, args.group_lesson_perhour_penalized_payment, args.rank])

                if (result.rows.length < 1) {
                    throw {
                        detail: 'insert done row is none'
                    }
                }

                await pgclient.query('commit')

                return {
                    success: true
                }

            } catch (e) {
                try {
                    await pgclient.query('ROLLBACK')
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },
        delete_instructor_level: async (parent, args) => {

            try {

                await pgclient.query('begin')

                let result = await pgclient.query(`delete from instructor_level where id=$1 returning id`, [args.id])

                if (result.rows.length !== 1) {
                    throw {
                        detail: 'delete affected row not one'
                    }
                }

                await pgclient.query('commit')

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
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