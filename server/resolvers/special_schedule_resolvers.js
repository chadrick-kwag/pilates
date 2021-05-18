
const pgclient = require('../pgclient')

module.exports = {

    Query: {
        fetch_special_schedule_by_id: async (parent, args) => {
            try {
                let result = await pgclient.query(`select id, starttime, endtime, title, memo from special_schedule where id=$1`, [args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no schedule found'
                    }
                }

                return {
                    success: true,
                    schedule: result.rows[0]
                }
            }
            catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            }
        }
    },

    Mutation: {
        create_special_schedule: async (parent, args) => {
            try {
                await pgclient.query('begin')


                let result = await pgclient.query('insert into special_schedule (starttime, endtime, title, memo) values ($1, $2, $3, $4)', [
                    args.starttime, args.endtime, args.title, args.memo
                ])


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
            try {

                await pgclient.query('begin')
                let result = await pgclient.query('update special_schedule set starttime=$1, endtime=$2, title=$3, memo=$4 where id=$5 returning id', [args.starttime, args.endtime, args.title, args.memo, args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'delete query not done properly'
                    }
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
