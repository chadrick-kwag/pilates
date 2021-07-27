const pgclient = require('../pgclient')
const { setting, save_setting } = require('../adminappconfig')


module.exports = {
    Query: {
        fetch_checkin_configs: async (parent, args, context) => {
            try {

                console.log(setting)

                return {
                    success: true,
                    config: setting.checkin_options
                }
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: 'error'
                }
            }
        }
    }
}