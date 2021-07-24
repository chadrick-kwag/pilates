const pgclient = require('../pgclient')
const {DateTime} = require('luxon')


module.exports = {
    Query:{
        query_clients_by_phonenumber: async (parent, args)=>{
            try{

                console.log(args)
                
                let results = await pgclient.query(`WITH A as (select id, translate(phonenumber, '-','') as phonenumber, name from client)

                select * from A
                where A.phonenumber = $1`,[args.phonenumber])

                console.log(results)

                return {
                    success: true,
                    clients: results.rows
                }

            }catch(e){
                console.log(e)

                return {
                    success: false,
                    msg: e.detail,
                    clients: []
                }
            }
        }
    }

}