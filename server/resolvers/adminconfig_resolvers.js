
const { setting, save_setting, update_setting } = require('../adminappconfig')
const { ensure_admin_account_id_in_context } = require('./common')


module.exports = {
    Query: {
        fetch_checkin_configs: async (parent, args, context) => {

            
            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

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
    },
    Mutation: {
        update_checkin_configs: async (parent, args, context) => {

            
            if (!ensure_admin_account_id_in_context(context)) {
                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {

                const newconfig = JSON.parse(args.newconfig)
                update_setting(newconfig, 'checkin_options')

                return {
                    success: true
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