const { _pgclient, pool } = require('../pgclient')
const { get_instructor_app_personid_for_token, add_instructor_token_for_personid } = require('../InstructorAppTokenCache')
const bcrypt = require('bcrypt')
const randomstring = require("randomstring");

module.exports = {
    Query: {

        check_person_can_create_instructor_account: async (parent, args, context) => {
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

            console.log(args)

            const inc_name = args.name.trim()
            const inc_pn = args.phonenumber.trim().replace(/-/g, '')

            console.log(inc_pn)

            try {
                await pgclient.query('begin')

                // check if person id exist with name and phonenumber, and check if account already created

                let result = await pgclient.query(`select instructor_app_account.id as account_id, person.id as personid from person  
                left join instructor_app_account on person.id = instructor_app_account.personid
                where person.name = $1 and replace(person.phonenumber,'-','') = $2 
                `, [inc_name, inc_pn])

                if (result.rowCount === 0) {
                    throw {
                        detail: 'person not found'
                    }
                }

                console.log(result.rows)

                if (result.rows[0].account_id !== null) {
                    throw {
                        detail: 'account already exist'
                    }
                }

                const personid = result.rows[0].personid

                // check if personid is either instructor/ apprentice instructor

                result = await pgclient.query(`select * from instructor where instructor.personid = $1`, [personid])

                if (result.rowCount === 0) {
                    // check apprentice instructor

                    result = await pgclient.query(`select * from apprentice_instructor where personid = $1`, [personid])

                    if (result.rowCount === 0) {
                        throw {
                            detail: 'person is not any kind of instructor'
                        }
                    }
                }

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
                } catch { }


                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }

            }



        },
        fetch_available_create_lesson_types: async (parent, args, context) => {
            // check instructor app account
            const instructor_personid = context.instructor_personid

            if (instructor_personid === null || instructor_personid === undefined) {
                return {
                    success: false,
                    msg: 'unauthorized access'
                }
            }

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
                // check if allowed to teach master class

                // fetch instructor id
                console.log('instructor personid')
                console.log(instructor_personid)

                const allowed_types = []

                let result = await pgclient.query(`select id, allow_teach_apprentice from instructor where personid = $1`, [instructor_personid])

                if (result.rowCount === 1) {
                    allowed_types.push('normal_lesson')

                    if (result.rows[0].allow_teach_apprentice === true) {
                        allowed_types.push('master_class')
                    }

                }

                // check if apprentice instructor. if so, then allowed to teach apprentice leading class

                result = await pgclient.query(`select id from apprentice_instructor where personid = $1`, [instructor_personid])

                if (result.rowCount === 1) {
                    allowed_types.push('apprentice_lesson')
                }

                pgclient.release()

                console.log('allowed types')
                console.log(allowed_types)

                return {
                    success: true,
                    lesson_types: allowed_types
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

        fetch_instructor_app_profile: async (parent, args, context) => {

            console.log('fetch_instructor_app_profile')
            console.log(args)
            console.log(context)

            // check instructor app account token 
            const instructor_personid = context.instructor_personid

            if (instructor_personid === null || instructor_personid === undefined) {
                return {
                    success: false,
                    msg: 'unauthorized access'
                }
            }


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

                let result = await pgclient.query(`select person.name, person.phonenumber from person where id=$1`, [instructor_personid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no instructor found'
                    }
                }

                return {
                    success: true,
                    profile: {
                        name: result.rows[0].name,
                        phonenumber: result.rows[0].phonenumber
                    }
                }

            } catch (e) {
                console.log(e)

                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        check_instructor_app_token: async (parent, args, context) => {

            console.log('check_instructor_app_token')
            console.log(args)

            // check if token is valid
            const personid = get_instructor_app_personid_for_token(args.token)

            console.log('personid')
            console.log(personid)

            if (personid === null) {
                return {
                    success: false,
                }
            }

            return {
                success: true,
                msg: 'invalid token'
            }
        },
        try_instructor_app_login: async (parent, args, context) => {



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

            // check if user exists
            try {
                let result = await pgclient.query(`select id, convert_from(password, 'utf8') as password, personid from instructor_app_account where username=$1`, [args.username])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no user found'
                    }
                }

                const answer_password = result.rows[0].password
                const account_id = result.rows[0].id
                const personid = result.rows[0].personid




                const compare_result = bcrypt.compareSync(args.password, answer_password)

                if (!compare_result) {
                    throw {
                        detail: 'incorrect password'
                    }

                }


                // generate token for this user
                let token = randomstring.generate({ length: 10 })
                while (get_instructor_app_personid_for_token(token) !== null) {
                    token = randomstring.generate({ length: 10 })
                }
                add_instructor_token_for_personid(token, personid)

                pgclient.release()

                return {
                    success: true,
                    username: args.username,
                    token: token
                }


            } catch (e) {
                console.log(e)
                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        check_person_and_can_create_instructor_app_account: async (parent, args, context) => {


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

                // check if person exists with name and phonenumber

                const _phonenumber = args.phonenumber.replaceAll('-', '').trim()

                let result = await pgclient.query(`select id from person where person.name=$1 and reaplce(person.phonenumber, '-','') = $2`, [args.name, _phonenumber])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no person found'
                    }
                }

                const personid = result.rows[0].id

                // check if account is already created with this person id

                result = await pgclient.query(`select id from instructor_app_account where personid = $1`, [personid])

                if (result.rowCount > 0) {
                    throw {
                        detail: 'account exist for this person'
                    }
                }

                pgclient.release()

                return {
                    success: true
                }




            } catch (e) {
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



        change_password_of_instructor_app_account: async (parent, args, context) => {

            const instructor_personid = context.instructor_personid

            if (instructor_personid === null || instructor_personid === undefined) {
                return {
                    success: false,
                    msg: 'unauthorized access'
                }
            }

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
                // check if current password is correct 

                await pgclient.query('begin')


                let result = await pgclient.query(`select convert_from(password, 'utf8') as password from instructor_app_account where personid=$1`, [instructor_personid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no account found'
                    }
                }


                const existing_password = result.rows[0].password
                const compare_result = bcrypt.compareSync(args.current_pw, existing_password)

                if (!compare_result) {
                    throw {
                        detail: 'incorrect password'
                    }

                }

                // create new pass word encryption



                const salt = bcrypt.genSaltSync(10)
                const encryptpw = bcrypt.hashSync(args.new_password, salt)

                await pgclient.query(`update instructor_app_account set password=$1 where personid=$2`, [encryptpw, instructor_personid])



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
                }
                catch { }

                pgclient.release()

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        create_instructor_app_account: async (parent, args, context) => {
            console.log('create_instructor_app_account')
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


            const inc_name = args.name.trim()
            const inc_pn = args.phonenumber.trim().replace(/-/g, '')

            if(inc_name === "" || inc_pn === ""){
                return {
                    success: false,
                    msg: 'invalid name or phonenumber'
                }
            }

            try {
                await pgclient.query('begin')

                // check if person id exist with name and phonenumber, and check if account already created

                let result = await pgclient.query(`select instructor_app_account.id as account_id, person.id as personid from person  
                left join instructor_app_account on person.id = instructor_app_account.personid
                where person.name = $1 and replace(person.phonenumber,'-','') = $2 
                `, [inc_name, inc_pn])

                if (result.rowCount === 0) {
                    throw {
                        detail: 'person not found'
                    }
                }

                console.log(result.rows)

                if (result.rows[0].account_id !== null) {
                    throw {
                        detail: 'account already exist'
                    }
                }

                const personid = result.rows[0].personid

                // check if personid is either instructor/ apprentice instructor

                result = await pgclient.query(`select * from instructor where instructor.personid = $1`, [personid])

                if (result.rowCount === 0) {
                    // check apprentice instructor

                    result = await pgclient.query(`select * from apprentice_instructor where personid = $1`, [personid])

                    if (result.rowCount === 0) {
                        throw {
                            detail: 'person is not any kind of instructor'
                        }
                    }
                }


                // create account

                const salt = bcrypt.genSaltSync(10)
                const encryptpw = bcrypt.hashSync(args.password, salt)


                await pgclient.query(`insert into instructor_app_account (username, password, personid) values ($1, $2, $3)`, [args.username, encryptpw, personid])

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            } catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')

                }
                catch { }

                pgclient.release()


                return {
                    success: false,
                    msg: e.detail
                }
            }



        }
    }
}