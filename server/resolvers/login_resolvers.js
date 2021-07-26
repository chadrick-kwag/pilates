const pgclient = require('../pgclient')
const randomstring = require("randomstring");

const token_cache = {}

module.exports = {
    Query: {
        try_login: async (parent, args) => {

            try {
                let result = await pgclient.query(`select id from user_pw where username=$1 and password=$2`, [args.username, args.password])

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
                    while (token_cache[token] !== undefined) {
                        token = randomstring.generate({ length: 10 })
                    }
                    token_cache[token] = user_id

                    console.log(token_cache)
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
        check_authtoken: async (parent, args) => {

            console.log(args.token)
            console.log(token_cache[args.token])

            if (token_cache[args.token] !== undefined) {
                return {
                    success: true
                }
            }

            return {
                success: false,
                msg: 'token invalid'
            }

        }
    },
    Mutation: {
        create_account: async (parent, args) => {

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

        }
    }
}