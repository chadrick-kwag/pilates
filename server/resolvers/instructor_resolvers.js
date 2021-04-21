const pgclient  = require('../pgclient')
const {
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
}  = require('./common')

module.exports = {
    Query: {

        fetch_instructor_stat: async (parent, args) =>{
            try{
                let result = await pgclient.query(`select count(1) as totalcount from instructor`)

                return {
                    success: true,
                    stat: {
                        total_count: result.rows[0].totalcount
                    }
                }
            }
            catch(err){
                return {
                    success: false,
                    msg: err.detail
                }
            }
        },
        
        fetch_instructors: async () => {
            let result = await pgclient.query(`select instructor.id as id,name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level, instructor_level.level_string as level_string, disabled from instructor
            left join instructor_level on level=instructor_level.id
            `).then(res => {

                console.log(res)
                console.log(res.rows)

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
            let results = await pgclient.query("select * from instructor where name=$1", [args.name]).then(res => {
                return res.rows
            })
                .catch(e => [])

            return results
        },
        
        fetch_instructor_with_id: async (parent, args)=>{

            console.log("inside fetch instructor with id")

            console.log(args)

            let result = await pgclient.query('select instructor.id as id, name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level, instructor_level.level_string as level_string, disabled from instructor left join instructor_level on level = instructor_level.id where instructor.id=$1', [args.id]).then(res=>{

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
        },
        fetch_instructor_level_info: async (parent, args)=>{
            console.log('fetch_instructor_level_info')
            console.log(args)

            let result = await pgclient.query(`select id, level_string from instructor_level where active=true`).then(res=>{
                return {
                    success: true,
                    info_list: res.rows
                }
            }).catch(e=>{
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
        
        create_instructor: async (parent, args) => {

            console.log(args)

            let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.job, parse_incoming_date_utc_string(args.validation_date), args.is_apprentice, args.memo, args.address, parse_incoming_date_utc_string(args.birthdate), args.level]

            console.log(_args)

            let ret = await pgclient.query('insert into instructor (name, phonenumber, gender, email, job, validation_date, is_apprentice, memo, address, birthdate, level) values ($1, $2, $3, $4, $5, to_timestamp($6), $7, $8, $9, to_timestamp($10), $11) ON CONFLICT (name, phonenumber) DO NOTHING', _args).then(res => {

                console.log(res)
                if (res.rowCount > 0) return {
                    success: true
                }

                return {
                    success: false,
                    msg: 'query failed. possibly duplicate exist'
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
            let ret = await pgclient.query('delete from instructor where id=$1', [args.id]).then(res => {
                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => false)

            return { success: ret }
        },


        update_instructor: async (parent, args) => {
            console.log('inside update instructor')
            console.log(args)

            let validation_date = args.validation_date
            if(validation_date!==null){
                validation_date = incoming_time_string_to_postgres_epoch_time(validation_date)
            }

            let birthdate = args.birthdate
            if(birthdate !== null){
                birthdate = incoming_time_string_to_postgres_epoch_time(birthdate)
            }

            let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.level, args.address, validation_date, birthdate, args.memo, args.is_apprentice, args.job, args.id]

            console.log(_args)

            let ret = await pgclient.query('update instructor set name=$1, phonenumber=$2, gender=$3, email=$4, level=$5, address=$6, validation_date=to_timestamp($7), birthdate=to_timestamp($8), memo=$9, is_apprentice=$10, job=$11 where id=$12', _args).then(res => {
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
            let result = await pgclient.query('update instructor set disabled=true where id=$1',[args.id]).then(res=>{
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
            let result = await pgclient.query('update instructor set disabled=false where id=$1',[args.id]).then(res=>{
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
        update_instructor_level: async (parent, args)=>{
            let result = await pgclient.query(`update instructor_level set level_string=$2 where id=$1`,[args.id, args.level_string]).then(res=>{
                if(res.rowCount>0){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: 'row count zero'
                    }
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: 'query error'
                }
            })

            return result
        },
        add_instructor_level: async (parent, args) => {
            let result = await pgclient.query(`insert into instructor_level (level_string, active) values ($1, $2) returning id`, [args.level_string, true]).then(res=>{
                if(res.rowCount>0){

                    console.log(res.rows)
                    let returnid = res.rows[0]['id']

                    return {
                        success: true,
                        id: returnid
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "insert failed"
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
        delete_instructor_level: async (parent, args) =>{
            let result = await pgclient.query(`delete from instructor_level where id=$1`, [args.id]).then(res=>{
                if(res.rowCount>0){
                    return {
                        success: true
                    }
                }
                else{
                    return {
                        success: false,
                        msg: "query failed"
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