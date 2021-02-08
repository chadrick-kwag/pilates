const pgclient = require('../pgclient')

const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
}  = require('./common')


module.exports = {

    Query: {

        fetch_clients: async (parent, args) => {
            let results = await pgclient.query("select id, name, phonenumber, created, job, email, birthdate, address, gender, memo, disabled from pilates.client").then(res => {

                return {
                    success: true,
                    clients: res.rows
                }
            }).catch(e => {
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return results
        },
        search_client_with_name: async (parent, args, context, info) => {
            console.log(args)
            let results = await pgclient.query("select * from pilates.client where name=$1", [args.name]).then(res => {
                
                return res.rows
                
                
            }).catch(e =>{
                console.log(e)
                return []
            })


            return results
        },
        query_clients_by_name: async (parent, args)=>{
            let results = await pgclient.query("select * from pilates.client where name=$1", [args.name]).then(res => {
                
                return {
                    success: true,
                    clients: res.rows
                }
                
                
            }).catch(e =>{
                console.log(e)
                return {
                    success: false
                }
            })


            return results
        },
        query_clientinfo_by_clientid: async (parent, args)=>{
            let result = await pgclient.query("select * from pilates.client where id=$1", [args.clientid]).then(res => {
                
                if(res.rowCount==1){
                    return {
                        success: true,
                        client: res.rows[0]
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "row count not 1"
                    }
                }
                
                
                
            }).catch(e =>{
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })


            return result
        }
    },
    Mutation: {

        createclient: async (parent, args) => {
            console.log(args)

            let gender = null
            if(args.gender!==null){
                if (args.gender.toLowerCase() === "male") {
                    gender = 'MALE'
                }
                else if (args.gender.toLowerCase() === "female") {
                    gender = 'FEMALE'
                }
            }
            
            let birthdate = -1
            if (args.birthdate) {
                birthdate = incoming_time_string_to_postgres_epoch_time(args.birthdate)
            }

            let pre_args = [args.name, args.phonenumber, gender, args.job, args.address, args.memo, args.email, birthdate]

            let ret = await pgclient.query("insert into pilates.client (name, phonenumber, gender, job, address, memo, email, birthdate) values ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $8 = -1 THEN NULL ELSE to_timestamp($8) END ) ON CONFLICT (name, phonenumber) DO NOTHING", pre_args).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return {
                        success: true
                    }
                }

                return {
                    success: false,
                    msg: 'failed to insert'
                }
            }).catch(err => {
                console.log(err)
                return {
                    success: false,
                    msg: 'error inserting query'
                }
            })

            return ret

        },

        disable_client_by_clientid: async (parent, args)=>{
            let ret = await pgclient.query('update pilates.client set disabled=true where id=$1',[args.clientid]).then(res=>{
                console.log(res)
                if(res.rowCount==1){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: 'rowcount not 1'
                    }
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return ret
        },

        able_client_by_clientid: async (parent, args)=>{
            let ret = await pgclient.query('update pilates.client set disabled=false where id=$1',[args.clientid]).then(res=>{
                console.log(res)
                if(res.rowCount==1){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: 'rowcount not 1'
                    }
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return ret
        },

        deleteclient: async (parent, args) => {
            console.log('delete client inside')
            let ret = await pgclient.query('delete from pilates.client where id=$1', [args.id]).then(res => {
                // console.log(res)
                if (res.rowCount > 0) return true

                return false
            })
                .catch(e => false)

            return { success: ret }
        },

        update_client: async (parent, args) => {

            console.log(args)

            let gender = null
            if (args.gender != null) {
                if (args.gender.toLowerCase() == 'male') {
                    gender = 'MALE'
                }
                else if (args.gender.toLowerCase() == 'female') {
                    gender = 'FEMALE'
                }
            }


            let birthdate = null

            if (args.birthdate) {
                birthdate = incoming_time_string_to_postgres_epoch_time(args.birthdate)
            }

            let prep_args = [
                args.name,
                args.phonenumber,
                args.email,
                args.memo,
                args.address,
                gender,
                args.job,
                birthdate,
                args.id
            ]

            let ret = await pgclient.query('update pilates.client set name=$1, phonenumber=$2, email=$3, memo=$4, address=$5, gender=$6, job=$7, birthdate=to_timestamp($8) where id=$9', prep_args).then(res => {
                console.log(res)
                if (res.rowCount > 0) {
                    return {
                        success: true
                    }
                }

                return {
                    success: false,
                    msg: 'update did not happen'
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'error updating'
                }
            })

            return ret
        },
    }

}