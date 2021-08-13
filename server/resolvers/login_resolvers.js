const { pool } = require('../pgclient')
const randomstring = require("randomstring");
const { add_token_for_id,
    remove_token_for_id, get_account_id_for_token } = require('../tokenCache')

const { ensure_admin_account_id_in_context } = require('./common')
const bcrypt = require('bcrypt')

const saltrounds = 10
module.exports = {
    Query: {
        fetch_admin_account_profile: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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


                const id = context.account_id

                let result = await pgclient.query(`select id, username, null as contact, created from admin_account where id=$1`, [id])

                if (result.rowCount !== 1) {
                    throw 'fetch failed'
                }

                pgclient.release()


                return {
                    success: true,
                    profile: result.rows[0]

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
        fetch_admin_accounts: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                console.log(context.account_id)
                return {
                    success: false,
                    msg: 'invalid token'
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


                let result = await pgclient.query(`select id, username, created, is_core_admin from admin_account`)
                pgclient.release()

                return {
                    success: true,
                    accounts: result.rows
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
        check_token_is_core_admin: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
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
                //check token is valid


                const admin_account_id = context.account_id

                if (admin_account_id === undefined) {
                    return {
                        success: false,
                        msg: 'invalid token'
                    }
                }

                // fetch is_core_admin 
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [admin_account_id])

                if (result.rowCount !== 1) {
                    throw 'no account found'
                }

                pgclient.release()

                return {
                    success: true,
                    is_core: result.rows[0].is_core_admin

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
        try_login: async (parent, args, context) => {

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

                // fetch hashed password
                let result = await pgclient.query(`select id,convert_from(password, 'utf8') as password from admin_account where username=$1`, [args.username])

                if (result.rowCount !== 1) {

                    throw { detail: "no user found" }
                }

                pgclient.release()

                const user_id = result.rows[0].id
                const db_pw = result.rows[0].password

                const compare_result = bcrypt.compareSync(args.password, db_pw)

                if (!compare_result) {

                    throw {
                        detail: 'incorrect password'
                    }
                }


                // generate token for this user
                let token = randomstring.generate({ length: 10 })
                while (get_account_id_for_token(token) !== null) {
                    token = randomstring.generate({ length: 10 })
                }
                add_token_for_id(token, user_id)

                return {
                    success: true,
                    username: args.username,
                    token: token
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
        check_admin_authtoken: async (parent, args) => {

            if (get_account_id_for_token(args.token) !== null) {
                return {
                    success: true
                }
            }

            return {
                success: false,
                msg: 'token invalid'
            }

        },
        fetch_admin_account_create_requests: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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

                let result = await pgclient.query(`select id, username, request_time from admin_account_request`)

                pgclient.release()

                return {
                    success: true,
                    requests: result.rows
                }
            } catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: e.detail
                }
            }
        }
    },
    Mutation: {
        change_my_admin_account_password: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            const userid = context.account_id

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


                // check if prev password is correct

                let result = await pgclient.query(`select convert_from(password, 'utf8') as password from admin_account where id=$1`, [userid])

                const db_exist_pw = result.rows[0].password

                if (!bcrypt.compareSync(args.existpassword, db_exist_pw)) {
                    throw 'existing password incorrect'
                }

                const encrypt_new_pw = bcrypt.hashSync(args.newpassword, saltrounds)

                result = await pgclient.query(`update admin_account set password=$1 where id=$2`, [encrypt_new_pw, userid])

                if (result.rowCount !== 1) {
                    throw "update failed"
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')
                    pgclient.release()

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {

                    return {
                        success: false,
                        msg: e.detail
                    }
                }

            }


        },
        update_core_status_of_admin_account: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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



                await pgclient.query('begin')

                let result = await pgclient.query(`update admin_account set is_core_admin=$1 where id=$2`, [args.status, args.id])

                if (result.rowCount !== 1) {
                    throw 'update failed'
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')
                    pgclient.release()

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },
        delete_admin_account: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            // check if trying to delete self. not allowed
            const userid = context.account_id
            if (userid === args.id) {
                return {
                    success: false,
                    msg: 'cannot delete self'
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



                await pgclient.query('begin')

                /// check if current user is core user
                let result = await pgclient.query(`select id from admin_account where is_core_admin=true and id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "current user is not core user"
                }

                result = await pgclient.query(`delete from admin_account where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw "delete fail"
                }

                await pgclient.query('commit')
                pgclient.release()

                // remove from token cache
                remove_token_for_id(args.id)


                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)
                try {
                    await pgclient.query('rollback')
                    pgclient.release()

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }


        },
        change_admin_account_password: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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

                await pgclient.query('begin')

                // check core user
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no user found"
                }

                if (!result.rows[0].is_core_admin) {
                    throw 'not core user'
                }

                const encryptpw = bcrypt.hashSync(args.password, saltrounds)

                result = await pgclient.query(`update admin_account set password=$1 where id=$2`, [encryptpw, args.id])

                if (result.rowCount !== 1) {
                    throw 'no update done'
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            } catch (e) {
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
        },
        approve_admin_account_request: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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



                await pgclient.query('BEGIN')


                // check if current user is core user
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw 'not core user'
                }

                result = await pgclient.query(`select username, password from admin_account_request where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw 'no request found'
                }

                const a = result.rows[0]

                result = await pgclient.query(`insert into admin_account(username, password) values ($1, $2)`, [a.username, a.password])

                if (result.rowCount !== 1) {
                    throw 'creating fail'
                }

                //  remove from request table
                result = await pgclient.query(`delete from admin_account_request where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw 'delete from request failed'
                }

                await pgclient.query('COMMIT')
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

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }
            }
        },
        create_account: async (parent, args, context) => {

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
                await pgclient.query('BEGIN')

                // encrypt password
                const salt = bcrypt.genSaltSync(saltrounds)
                const pwhash = bcrypt.hashSync(args.password, salt)

                console.log(pwhash)

                let result = await pgclient.query(`insert into admin_account(username, password) values ($1, $2)
                `, [args.username, pwhash])

                if (result.rowCount !== 1) {
                    throw "create account failed"
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
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.details
                    }
                }

                return {
                    success: false,
                    msg: e.details
                }
            }

        },
        decline_admin_account_request: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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

                await pgclient.query('BEGIN')

                // check if current user is core user
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "not core user"
                }

                //  remove from request table
                result = await pgclient.query(`delete from admin_account_request where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw 'delete from request failed'
                }

                await pgclient.query('COMMIT')
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

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }
            }

        },
        request_admin_account_creation: async (parent, args, context) => {



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

                await pgclient.query('BEGIN')

                // check incoming username does not exist in admin accounts
                let result = await pgclient.query(`select id from admin_account where username=$1`, [args.username])

                if (result.rowCount > 0) {
                    throw "username already in use"
                }


                const salt = bcrypt.genSaltSync(saltrounds)
                const encryptpw = bcrypt.hashSync(args.password, salt)

                result = await pgclient.query(`insert into admin_account_request(username, password, contact) values ($1, $2, $3)`, [args.username, encryptpw, args.contact])

                if (result.rowCount === 0) {
                    throw 'insert failed'
                }



                await pgclient.query('COMMIT')
                pgclient.release()

                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('ROLLBACK')
                    pgclient.release()

                    if (e.code === '23505') {
                        return {
                            success: false,
                            msg: 'username exist'
                        }
                    }
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }
            }
        }
    }
}