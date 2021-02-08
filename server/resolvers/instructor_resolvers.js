const pgclient  = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
}  = require('./common')

module.exports = {
    Query: {
        
        fetch_instructors: async () => {
            let result = await pgclient.query("select id,name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level, disabled from pilates.instructor").then(res => {

                console.log(res)

                return {
                    success: true,
                    instructors: res.rows

                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'

                }
            })

            return result
        },
        
        search_instructor_with_name: async (parent, args, context, info) => {
            let results = await pgclient.query("select * from pilates.instructor where name=$1", [args.name]).then(res => {
                return res.rows
            })
                .catch(e => [])

            return results
        },
        
        fetch_instructor_with_id: async (parent, args)=>{

            console.log("inside fetch instructor with id")

            console.log(args)

            let result = await pgclient.query('select id,name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level, disabled from pilates.instructor where id=$1', [args.id]).then(res=>{

                if(res.rowCount==1){
                    return {
                        success: true,
                        instructor: res.rows[0]
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "rowcount not 1"
                    }
                }

                
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        }
    },
    Mutation: {
        
        create_instructor: async (parent, args) => {

            console.log(args)

            let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.job, parse_incoming_date_utc_string(args.validation_date), args.is_apprentice, args.memo, args.address, parse_incoming_date_utc_string(args.birthdate), args.level]

            console.log(_args)

            let ret = await pgclient.query('insert into pilates.instructor (name, phonenumber, gender, email, job, validation_date, is_apprentice, memo, address, birthdate, level) values ($1, $2, $3, $4, $5, to_timestamp($6), $7, $8, $9, to_timestamp($10), $11) ON CONFLICT (name, phonenumber) DO NOTHING', _args).then(res => {

                console.log(res)
                if (res.rowCount > 0) return {
                    success: true
                }

                return {
                    success: false,
                    msg: 'query failed'
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: "query error"
                }
            })

            return ret

        },
        deleteinstructor: async (parent, args) => {
            let ret = await pgclient.query('delete from pilates.instructor where id=$1', [args.id]).then(res => {
                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => false)

            return { success: ret }
        },


        update_instructor: async (parent, args) => {
            console.log(args)

            let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.level, args.address, incoming_time_string_to_postgres_epoch_time(args.validation_date), incoming_time_string_to_postgres_epoch_time(args.birthdate), args.memo, args.is_apprentice, args.job, args.id]

            console.log(_args)

            let ret = await pgclient.query('update pilates.instructor set name=$1, phonenumber=$2, gender=$3, email=$4, level=$5, address=$6, validation_date=to_timestamp($7), birthdate=to_timestamp($8), memo=$9, is_apprentice=$10, job=$11 where id=$12', _args).then(res => {
                if (res.rowCount > 0) {
                    return {
                        success: true
                    }
                }
                return {
                    success: false,
                    msg: 'no instructor updated'
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: true,
                    msg: 'error updating instructor'
                }
            })


            return ret
        },
        disable_instructor_by_id: async (parent, args)=>{
            let result = pgclient.query('update pilates.instructor set disabled=true where id=$1',[args.id]).then(res=>{
                if(res.rowCount==1){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "row count not 1"
                    }
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        },
        able_instructor_by_id: async (parent, args)=>{
            let result = pgclient.query('update pilates.instructor set disabled=false where id=$1',[args.id]).then(res=>{
                if(res.rowCount==1){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "row count not 1"
                    }
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })

            return result
        }
    }
}