const { pool } = require('../pgclient')


module.exports = {
    Query: {
        fetch_persons_by_name_and_phonenumber: async (parent, args, context) => {

            const _arg_phonenumber = args.phonenumber.trim().replaceAll('-', '')

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
                let result = await pgclient.query(`select * from person where name=$1 and replace(phonenumber,'-','')=$2`, [args.name, _arg_phonenumber])

                pgclient.release()
                return {
                    success: true,
                    persons: result.rows
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
        fetch_persons_by_name: async (parent, args, context) => {

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
                let result = await pgclient.query(`select * from person where name=$1`, [args.name])
                pgclient.release()

                return {
                    success: true,
                    persons: result.rows

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
        }

    }
}