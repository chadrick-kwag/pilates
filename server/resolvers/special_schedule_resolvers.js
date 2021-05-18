
const pgclient = require('../pgclient')

module.exports = {
    
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
                let result = await pgclient.query('delete from special_schedule where id=$1 returning id', [args.id])

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
