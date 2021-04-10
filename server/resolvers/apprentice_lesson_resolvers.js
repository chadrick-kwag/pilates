const { FlareSharp } = require('@material-ui/icons')
const pgclient = require('../pgclient')


module.exports = {

    Query: {
    },
    Mutation: {
        create_apprentice_lesson: async (parent, args) => {
            try {

                console.log('create_apprentice_lesson')
                console.log(args)

                let res = await pgclient.query('BEGIN')

                // check consistency of incoming appinstid, AT, GT
                res = await pgclient.query(`select * from apprentice_instructor_plan where apprentice_instructor_id=$1 and activity_type=$2 and grouping_type=$3 and id=$4`, [
                    args.apprentice_instructor_id, args.activity_type, args.grouping_type, args.plan_id
                ])

                console.log(res)

                if (res.rows.length !== 1) {
                    throw {
                        detail: 'inconsistentcy in given params'
                    }
                }

                // check free tickets with requested amount exist

                res = await pgclient.query(`select apprentice_ticket.id as id, 
                apprentice_ticket.expire_time
                from apprentice_ticket
                left join (select DISTINCT ON(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc) as A
                on A.apprentice_ticket_id = apprentice_ticket.id
                where apprentice_ticket.creator_plan_id = $1
                and (A.created is null OR (A.created is not null AND A.canceled_time is not null))
                and apprentice_ticket.expire_time > now()
                `, [args.plan_id])

                console.log(res)


                // check amount
                if (res.rows.length < args.hours) {
                    throw {
                        detail: 'no enough unconsumed tickets'
                    }
                }

                // select tickets to consume
                const consume_ticket_id_arr = []

                for (let i = 0; i < args.hours; i++) {
                    consume_ticket_id_arr.push(res.rows[i].id)
                }

                console.log(`consume_ticket_id_arr: ${consume_ticket_id_arr}`)

                // create lesson

                const starttime = args.starttime
                const endtime = new Date(args.starttime)
                endtime.setHours(endtime.getHours() + args.hours)

                console.log(`endtime: ${endtime}`)

                res = await pgclient.query(`insert into apprentice_lesson (apprentice_instructor_id, starttime, endtime, created, activity_type, grouping_type) values ($1, $2, $3, now(), $4, $5) returning id`, [
                    args.apprentice_instructor_id, args.starttime, endtime, args.activity_type, args.grouping_type
                ])

                const created_lesson_id = res.rows[0].id

                console.log(`created_lesson_id: ${created_lesson_id}`)


                // insert to assign_apprentice_ticket

                for (let i = 0; i < consume_ticket_id_arr.length; i++) {
                    await pgclient.query(`insert into assign_apprentice_ticket (apprentice_ticket_id, apprentice_lesson_id, created) values ($1, $2, now())`, [
                        consume_ticket_id_arr[i], created_lesson_id
                    ])

                }

                await pgclient.query('COMMIT')

                return {
                    success: true
                }


            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }
        },
        change_apprentice_lesson_starttime: async (parent, args) => {
            try {
                console.log(args)

                let res = await pgclient.query('BEGIN')

                // get duration of lesson
                res = await pgclient.query(`select extract(epoch from endtime - starttime) as duration, endtime from apprentice_lesson where id=$1`, [args.lessonid])

                if (res.rows.length !== 1) {
                    throw {
                        detail: 'no rows to change'
                    }
                }

                const duration = res.rows[0].duration

                const starttime = new Date(args.starttime)
                const new_endtime = new Date(res.rows[0].endtime)
                const b = starttime.getTime() + duration * 1000

                new_endtime.setTime(b)

                res = await pgclient.query(`update apprentice_lesson set starttime=$1, endtime=$2 where id=$3 returning id`, [
                    args.starttime, new_endtime.toUTCString(), args.lessonid
                ])

                await pgclient.query('COMMIT')


                return {
                    success: true
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }
        },
        cancel_apprentice_lesson: async (parent, args) =>{
            try{

                let res = await pgclient.query('BEGIN')

                // cancel lesson
                res = await pgclient.query(`update apprentice_lesson set canceled_time=now() where id=$1 returning id`, [args.lessonid])

                if(res.rows.length!==1){
                    throw {
                        detail: 'affected row not 1'
                    }
                }

                // cancel assign tickets. meaning, this cancel is no penalty cancel for instructor

                // fetch assignment ids
                res = await pgclient.query(`select id from assign_apprentice_ticket where apprentice_lesson_id=$1`,[args.lessonid])

                const assign_ids = res.rows.map(d=>d.id)

                console.log('assign_ids')
                console.log(assign_ids)
                
                for(let i=0;i<assign_ids.length;i++){
                    res = await pgclient.query(`update assign_apprentice_ticket set canceled_time=now() where id=$1 `,[assign_ids[i]])
                }




                await pgclient.query('COMMIT')

                return {
                    success: true
                }

            } catch (e) {
                console.log(e)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (err) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }
        }
    }



}