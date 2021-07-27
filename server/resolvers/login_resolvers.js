const pgclient = require('../pgclient')
const randomstring = require("randomstring");
const { add_token_for_id,
    remove_token_for_id, get_account_id_for_token } = require('../tokenCache')

const { ensure_admin_account_id_in_context } = require('./common')


module.exports = {
    Query: {
        fetch_admin_account_profile: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {


                const id = context.account_id

                let result = await pgclient.query(`select id, username, null as contact, created from admin_account where id=$1`, [id])

                if (result.rowCount !== 1) {
                    throw 'fetch failed'
                }


                return {
                    success: true,
                    profile: result.rows[0]

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
        fetch_admin_accounts: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {


                let result = await pgclient.query(`select id, username, created, is_core_admin from admin_account`)

                return {
                    success: true,
                    accounts: result.rows
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
        check_token_is_core_admin: async (parent, args, context) => {

            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
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

                return {
                    success: true,
                    is_core: result.rows[0].is_core_admin

                }

            } catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            }
        },
        try_login: async (parent, args, context) => {

            try {
                let result = await pgclient.query(`select id from admin_account where username=$1 and password=$2`, [args.username, args.password])

                if (result.rowCount === 0) {
                    throw "no user found"
                }
                else if (result.rowCount > 1) {
                    throw "multiple account found"
                }
                else {

                    const user_id = result.rows[0].id

                    // generate token

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
            }
            catch (e) {

                console.log(e)

                return {
                    success: false,
                    msg: e.details
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

            try {



                let result = await pgclient.query(`select id, username, request_time from admin_account_request`)

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

            try {
                await pgclient.query('begin')

                // check if prev password is correct
                let result = await pgclient.query(`select id from admin_account where id=$1 and password=$2`, [userid, args.existpassword])

                if (result.rowCount !== 1) {
                    throw "existing password incorrect"
                }

                result = await pgclient.query(`update admin_account set password=$1 where id=$2`, [args.newpassword, userid])

                if (result.rowCount !== 1) {
                    throw "update failed"
                }

                await pgclient.query('commit')

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')

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

            try {



                await pgclient.query('begin')

                let result = await pgclient.query(`update admin_account set is_core_admin=$1 where id=$2`, [args.status, args.id])

                if (result.rowCount !== 1) {
                    throw 'update failed'
                }

                await pgclient.query('commit')

                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')

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

                // remove from token cache
                remove_token_for_id(userid)


                return {
                    success: true
                }
            }
            catch (e) {
                try {
                    await pgclient.query('rollback')

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

            try {

                await pgclient.query('begin')

                let result = await pgclient.query(`update admin_account set password=$1 where id=$2`, [args.password, args.id])

                if (result.rowCount !== 1) {
                    throw 'no update done'
                }

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
        },
        approve_admin_account_request: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {



                await pgclient.query('BEGIN')


                // check if current user is core user
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, context.account_id)

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

                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')

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


            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {
                await pgclient.query('BEGIN')

                let result = await pgclient.query(`insert into user_pw(username, password, is_client, is_apprentice, is_instructor, is_admin) values ($1, $2, true, false, false, false)
                `, [args.username, args.password])

                if (result.rowCount !== 1) {
                    throw "create account failed"
                }

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

                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('rollback')

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


            try {

                await pgclient.query('BEGIN')

                // check incoming username does not exist in admin accounts
                let result = await pgclient.query(`select id from admin_account where username=$1`, [args.username])

                if (result.rowCount > 0) {
                    throw "username already in use"
                }

                result = await pgclient.query(`insert into admin_account_request(username, password, contact) values ($1, $2, $3)`, [args.username, args.password, args.contact])

                if (result.rowCount === 0) {
                    throw 'insert failed'
                }



                await pgclient.query('COMMIT')

                return {
                    success: true
                }
            }
            catch (e) {
                console.log(e)

                try {
                    await pgclient.query('ROLLBACK')

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