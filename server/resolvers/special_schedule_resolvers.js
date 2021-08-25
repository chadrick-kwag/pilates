
const { pool } = require('../pgclient')

module.exports = {

    Query: {
        fetch_special_schedule_by_id: async (parent, args) => {


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
                let result = await pgclient.query(`select id, starttime, endtime, title, memo from special_schedule where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no schedule found'
                    }
                }
                pgclient.release()

                return {
                    success: true,
                    schedule: result.rows[0]
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
    },

    Mutation: {
        create_special_schedule: async (parent, args) => {

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


                let result = await pgclient.query('insert into special_schedule (starttime, endtime, title, memo) values ($1, $2, $3, $4)', [
                    args.starttime, args.endtime, args.title, args.memo
                ])


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
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }


            }
        },

        change_special_schedule: async (parent, args) => {

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
                let result = await pgclient.query('update special_schedule set starttime=$1, endtime=$2, title=$3, memo=$4 where id=$5 returning id', [args.starttime, args.endtime, args.title, args.memo, args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'delete query not done properly'
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
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },
        delete_special_schedule: async (parent, args) => {

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

                let result = await pgclient.query('delete from special_schedule where id=$1 returning id', [args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'delete row not one'
                    }
                }

                await pgclient.query('commit')
                pgclient.release()

                return {
                    success: true
                }
            } catch (e) {

                try {
                    await pgclient.query('rollback')
                    pgclient.release()
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e2.detail
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
