const pgclient = require('../pgclient')
const { ensure_admin_account_id_in_context } = require('./common')


module.exports = {

    Query: {
        fetch_ticket_avail_plan_and_ticketid_arr_of_apprentice_instructor_and_lesson_type: async (parent, args, context) => {

            console.log('fetch_ticket_avail_plan_and_ticketid_arr_of_apprentice_instructor_and_lesson_type')

            try {


                await pgclient.query('begin')

                // gather available plans for apprentice instructor for given at, gt
                let result = await pgclient.query(`select apprentice_instructor_plan.id as planid, count(apprentice_ticket.id) as total_rounds from apprentice_instructor_plan
                left join apprentice_ticket on apprentice_ticket.id = apprentice_instructor_plan.id
                where apprentice_instructor_plan.apprentice_instructor_id = $1 and apprentice_instructor_plan.activity_type = $2 and apprentice_instructor_plan.grouping_type = $3
                group by apprentice_instructor_plan.id
                
                `, [args.apprentice_instructor_id, args.activity_type, args.grouping_type])


                // gather avail tickets for each plan

                const output = []
                for (let i = 0; i < result.rows.length; i++) {
                    const planid = result.rows[i].planid

                    let res = await pgclient.query(`with A as (select distinct on(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc)


                    select apprentice_ticket.id as id, apprentice_ticket.expire_time from apprentice_ticket
                    left join A on A.apprentice_ticket_id = apprentice_ticket.id
                    where apprentice_ticket.creator_plan_id = $1
                    and A.canceled_time is null`, [planid])

                    if (res.rowCount === 0) {
                        continue
                    }

                    result.rows[i].avail_tickets = res.rows
                    output.push(result.rows[i])
                }



                console.log(output)

                await pgclient.query('commit')

                return {
                    success: true,
                    plan_and_tickets: output
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
                        msg: e.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }
        },

        fetch_apprentice_instructor_plans: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {

                let res = await pgclient.query(`select apprentice_instructor_plan.id, person.name as apprentice_instructor_name, 
                apprentice_instructor.id as apprentice_instructor_id,
                activity_type,
                grouping_type,
                apprentice_instructor_plan.created,
                totalcost,
                rounds,
                person.phonenumber as apprentice_instructor_phonenumber
                from apprentice_instructor_plan
                left join apprentice_instructor on apprentice_instructor_plan.apprentice_instructor_id = apprentice_instructor.id
                left join person on person.id = apprentice_instructor.personid
                `)

                return {
                    success: true,
                    plans: res.rows
                }

            }
            catch (e) {
                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        fetch_apprentice_plan_by_id: async (parent, args, context) => {



            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {

                let res = await pgclient.query(`select apprentice_instructor_plan.id as id, person.name as apprentice_instructor_name, person.phonenumber as apprentice_instructor_phonenumber,
                apprentice_instructor.id as apprentice_instructor_id,
                activity_type,
                grouping_type,
                apprentice_instructor_plan.created,
                totalcost,
                rounds
                from apprentice_instructor_plan
                left join apprentice_instructor on apprentice_instructor.id = apprentice_instructor_plan.apprentice_instructor_id
                left join person on person.id = apprentice_instructor.personid
                where apprentice_instructor_plan.id=$1
                `, [args.id])



                return {
                    success: true,
                    plans: res.rows
                }
            } catch (e) {
                cosnole.log(e)

                return {
                    success: false,
                    msg: e.detail
                }
            }

        },
        fetch_apprentice_tickets_of_plan: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {

                let res = await pgclient.query(`select apprentice_ticket.id as id, 
                apprentice_ticket.expire_time,
                
                case 
                when A.canceled_time is null then apprentice_lesson.starttime
                else null
                end as consumed_time
                from apprentice_ticket 
                left join (select DISTINCT ON (apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc ) as A on apprentice_ticket.id = A.apprentice_ticket_id
                left join apprentice_lesson on apprentice_lesson.id = A.apprentice_lesson_id
                where creator_plan_id = $1`, [args.id])


                return {
                    success: true,
                    tickets: res.rows
                }


            } catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: err.detail
                }

            }
        },
        fetch_apprentice_plans_of_apprentice_instructor_and_agtype: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {

                const instid = args.apprentice_instructor_id


                let res = await pgclient.query(`BEGIN`)

                res = await pgclient.query(`select apprentice_instructor_plan.id as id, 
                person.name as apprentice_instructor_name,
                apprentice_instructor.id as apprentice_instructor_id,
                person.phonenumber as apprentice_instructor_phonenumber,
                apprentice_instructor_plan.activity_type as activity_type,
                apprentice_instructor_plan.grouping_type as grouping_type,
                apprentice_instructor_plan.created as created,
                apprentice_instructor_plan.totalcost as totalcost
                from apprentice_instructor_plan
                left join apprentice_instructor on apprentice_instructor_plan.apprentice_instructor_id = apprentice_instructor.id
                left join person on person.id = apprentice_instructor.personid
                where apprentice_instructor_id=$1
                and activity_type=$2 and grouping_type=$3
                `, [instid, args.activity_type, args.grouping_type])

                // for each plan, get remain rounds
                const fetched_plans = res.rows

                for (let i = 0; i < fetched_plans.length; i++) {
                    const p = fetched_plans[i]

                    res = await pgclient.query(`select 

                    count(1) as totalrows,
                    sum( CASE
                        WHEN apprentice_ticket.expire_time < now() THEN 0
                    WHEN A.created is null THEN 1
                    WHEN A.created is not null AND A.canceled_time is not null THEN 1
                    
                    ELSE 0 END) as is_not_consumed
                    
                    from apprentice_ticket
                    left join (select DISTINCT ON(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc) as A
                    on A.apprentice_ticket_id = apprentice_ticket.id
                    where apprentice_ticket.creator_plan_id = $1`, [p.id])

                    const remainrounds = res.rows[0].is_not_consumed
                    const totalrounds = res.rows[0].totalrows
                    fetched_plans[i]['remainrounds'] = remainrounds
                    fetched_plans[i]['rounds'] = totalrounds
                }


                await pgclient.query(`commit`)

                return {
                    success: true,
                    plans: fetched_plans
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
        fetch_apprentice_plans_of_apprentice_instructor: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }



            try {

                let res = await pgclient.query(`BEGIN`)


                // get basic plan info of condition
                res = await pgclient.query(`select apprentice_instructor_plan.id as id, 
                person.name as apprentice_instructor_name,
                apprentice_instructor.id as apprentice_instructor_id,
                person.phonenumber as apprentice_instructor_phonenumber,
                apprentice_instructor_plan.activity_type as activity_type,
                apprentice_instructor_plan.grouping_type as grouping_type,
                apprentice_instructor_plan.created as created,
                apprentice_instructor_plan.totalcost as totalcost
                from apprentice_instructor_plan
                left join apprentice_instructor on apprentice_instructor_plan.apprentice_instructor_id = apprentice_instructor.id
                left join person on person.id  = apprentice_instructor.personid
                where apprentice_instructor_id=$1
                
                `, [args.appinst_id])

                // for each plan, get remain rounds
                const fetched_plans = res.rows

                for (let i = 0; i < fetched_plans.length; i++) {
                    const p = fetched_plans[i]

                    res = await pgclient.query(`select 

                    count(1) as totalrows,
                    sum( CASE
                        WHEN apprentice_ticket.expire_time < now() THEN 0
                    WHEN A.created is null THEN 1
                    WHEN A.created is not null AND A.canceled_time is not null THEN 1
                    
                    ELSE 0 END) as is_not_consumed
                    
                    from apprentice_ticket
                    left join (select DISTINCT ON(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc) as A
                    on A.apprentice_ticket_id = apprentice_ticket.id
                    where apprentice_ticket.creator_plan_id = $1`, [p.id])

                    const remainrounds = res.rows[0].is_not_consumed
                    const totalrounds = res.rows[0].totalrows
                    fetched_plans[i]['remainrounds'] = remainrounds
                    fetched_plans[i]['rounds'] = totalrounds
                }


                await pgclient.query(`commit`)

                return {
                    success: true,
                    plans: fetched_plans
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

    },
    Mutation: {
        update_totalcost_of_plan: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {
                await pgclient.query('begin')

                let result = await pgclient.query(`update apprentice_instructor_plan set totalcost=$1 where id=$2`, [args.totalcost, args.id])

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
                        msg: e.detail
                    }
                }

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        create_apprentice_plan: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {
                await pgclient.query('BEGIN')

                // check if core user
                let res = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (res.rowCount !== 1) {
                    throw "no account"
                }

                if (!res.rows[0].is_core_admin) {
                    throw "not core user"
                }


                res = await pgclient.query(`insert into apprentice_instructor_plan (apprentice_instructor_id, rounds, totalcost, activity_type, grouping_type, created) values ($1, $2, $3, $4, $5, now()) returning id`, [args.apprentice_instructor_id, args.rounds, args.totalcost, args.activity_type, args.grouping_type])

                let id = res.rows[0].id

                console.log(`returned id: ${id}`)

                res = await pgclient.query(`insert into apprentice_ticket (expire_time, creator_plan_id) (select $3, $1 from generate_series(1,$2))`, [id, args.rounds, args.expiretime])

                await pgclient.query('COMMIT')

                return {
                    success: true
                }


            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
            }

        },
        add_apprentice_tickets_to_plan: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            try {

                let res = await pgclient.query('BEGIN')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                // check plan with id exist
                res = await pgclient.query(`select * from apprentice_instructor_plan where id=$1`, [args.id])

                if (res.rows.length === 0) {
                    return {
                        success: false,
                        msg: 'no plan with id found'
                    }
                }

                console.log('plan exist checked')
                console.log(`id type: ${typeof (args.id)}`)
                // get per round cost
                res = await pgclient.query(`select totalcost/A.count as percost, totalcost from apprentice_instructor_plan 
                left join (select count(1), $1::int as id from apprentice_ticket where creator_plan_id = $2::int ) as A on A.id = apprentice_instructor_plan.id where apprentice_instructor_plan.id = $3::int`, [args.id, args.id, args.id])

                console.log(res)

                if (res.rows.length !== 1) {
                    return {
                        success: false,
                        msg: 'per ticket cost query fail'
                    }
                }

                let percost = res.rows[0].percost
                let totalcost = res.rows[0].totalcost

                console.log(res)

                res = await pgclient.query(`select DISTINCT ON(expire_time) *  from apprentice_ticket where creator_plan_id=$1
                order by expire_time desc`, [args.id])

                console.log(res)

                let expire_time
                if (res.rows.length === 0) {
                    return {
                        success: false,
                        msg: 'expire time get fail'
                    }
                }

                console.log(res.rows[0].expire_time)
                expire_time = res.rows[0].expire_time

                console.log('expire_time')
                console.log(expire_time)

                // insert new tickets
                res = await pgclient.query(`insert into apprentice_ticket (expire_time, creator_plan_id) (select $1, $2 from generate_series(1,$3))`, [expire_time, args.id, args.amount])

                // update totalcost of plan
                let newtotalcost = totalcost + args.amount * percost

                res = await pgclient.query(`update apprentice_instructor_plan set totalcost=$1 where id=$2`, [newtotalcost, args.id])

                res = await pgclient.query('COMMIT')

                return {
                    success: true
                }

            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },
        change_expire_time_of_apprentice_tickets: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }



            if (args.id_arr.length === 0) {
                return {
                    success: false,
                    msg: 'no id given'
                }
            }

            try {
                let res = await pgclient.query('BEGIN')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                for (let i = 0; i < args.id_arr.length; i++) {
                    res = await pgclient.query(`update apprentice_ticket set expire_time=$1 where id=$2`, [args.new_expire_time, args.id_arr[i]])
                }

                res = await pgclient.query('COMMIT')

                return {
                    success: true

                }

            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },
        transfer_apprentice_tickets_to_apprentice: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }


            if (args.id_arr.length == 0) {
                return {
                    success: false,
                    msg: 'no id given'
                }
            }

            try {


                let res = await pgclient.query('BEGIN')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                // check id exist
                res = await pgclient.query(`select * from apprentice_instructor where id=$1`, [args.apprentice_id])

                if (res.rows.length === 0) {
                    throw {
                        detail: 'invalid apprentice id'
                    }
                }
                // check if tickets are removable
                res = await pgclient.query(`with A as (select unnest  as given_id from unnest(cast($1 as int[])))
                select 
                CASE
                WHEN B.id is null THEN true
                WHEN B.id is not null AND B.canceled_time is not null THEN true
                ELSE false
                END
                as free
                
                from A
                left join apprentice_ticket on apprentice_ticket.id = A.given_id
                left join (select DISTINCT ON(apprentice_ticket_id) * from assign_apprentice_ticket order by apprentice_ticket_id, created desc) as B on B.apprentice_ticket_id = A.given_id
                `, [args.id_arr])

                console.log(res)

                for (let i = 0; i < res.rows.length; i++) {
                    if (!res.rows[i].free) {
                        throw {
                            detail: 'some ticket is already consumed'
                        }
                    }
                }

                // gather info of tickets
                res = await pgclient.query(`with A as (select unnest as given_id from unnest($1::int[]) )
                select apprentice_instructor_plan.id, apprentice_instructor_plan.activity_type, 
                apprentice_instructor_plan.grouping_type ,
                apprentice_instructor_plan.totalcost
                from A
                left join apprentice_ticket on apprentice_ticket.id = A.given_id
                left join apprentice_instructor_plan on apprentice_instructor_plan.id = apprentice_ticket.creator_plan_id
                group by apprentice_instructor_plan.id`, [args.id_arr])

                console.log(res)

                if (res.rows.length > 1) {
                    throw {
                        detail: 'tickets do not belong from same plan'
                    }
                }

                const planid = res.rows[0].id
                const activity_type = res.rows[0].activity_type
                const grouping_type = res.rows[0].grouping_type
                const totalcost = res.rows[0].totalcost

                // get percost
                res = await pgclient.query(`select count(1)::int as count from apprentice_ticket where creator_plan_id = $1`, [planid])

                console.log(res)

                if (res.rows.length === 0) {
                    throw {
                        detail: 'no tickets found for existing plan'
                    }
                }

                const percost = Math.ceil(totalcost / res.rows[0].count)

                const newtotalcost = percost * args.id_arr.length
                const newrounds = args.id_arr.length

                // create new plan to contain transferred tickets
                res = await pgclient.query(`insert into apprentice_instructor_plan (apprentice_instructor_id, rounds, totalcost, created, activity_type, grouping_type, transferred_from_plan_id) values ($1, $2, $3, now(), $4, $5, $6) returning id`, [args.apprentice_id, newrounds, newtotalcost, activity_type, grouping_type, planid])

                console.log(res)

                const newplanid = res.rows[0].id

                // update ticket to new plan
                for (let i = 0; i < args.id_arr.length; i++) {
                    await pgclient.query(`update apprentice_ticket set creator_plan_id=$1 where id=$2`, [newplanid, args.id_arr[i]])
                }

                // update existing plan, reduce total cost
                const reduced_totalcost = totalcost - newtotalcost

                await pgclient.query(`update apprentice_instructor_plan set totalcost = $1 where id=$2`, [reduced_totalcost, planid])

                await pgclient.query('COMMIT')

                return {
                    success: true
                }



            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },
        delete_apprentice_tickets: async (parent, args, context) => {


            if (!ensure_admin_account_id_in_context(context)) {

                return {
                    success: false,
                    msg: 'invalid token'
                }
            }

            try {
                let res = await pgclient.query('BEGIN')


                // check admin is core
                let result = await pgclient.query(`select is_core_admin from admin_account where id=$1`, [context.account_id])

                if (result.rowCount !== 1) {
                    throw "no account"
                }

                if (!result.rows[0].is_core_admin) {
                    throw "not core user"
                }

                // check ticket id_arr are valid and belong to same plan id
                let planid = null
                for (let i = 0; i < args.id_arr.length; i++) {
                    res = await pgclient.query(`select creator_plan_id from apprentice_ticket where id=$1`, [args.id_arr[i]])

                    if (res.rows.length !== 1) {
                        throw {
                            detail: 'invalid ticket id'
                        }

                    }

                    if (planid === null) {
                        planid = res.rows[0].creator_plan_id
                    }
                    else {
                        if (planid !== res.rows[0].creator_plan_id) {
                            throw {
                                detail: 'ticket ids not from same plan'
                            }
                        }
                    }
                }


                // get totalcost of plan
                res = await pgclient.query(`select totalcost from apprentice_instructor_plan where id=$1`, [planid])

                const totalcost = res.rows[0].totalcost

                // get existing ticket size
                res = await pgclient.query(`select count(1) as count from apprentice_ticket where creator_plan_id=$1`, [planid])

                const ticket_count = res.rows[0].count

                const percost = totalcost / ticket_count


                for (let i = 0; i < args.id_arr.length; i++) {
                    res = await pgclient.query(`delete from apprentice_ticket where id=$1`, [args.id_arr[i]])
                }

                // calculate new totalcost and update it.

                const new_totalcost = totalcost - (args.id_arr.length * percost)

                if (new_totalcost < 0) {
                    throw {
                        detail: 'new totalcost is negative'
                    }
                }

                await pgclient.query(`update apprentice_instructor_plan set totalcost=$1 where id=$2`, [new_totalcost, planid])

                await pgclient.query('COMMIT')

                return {
                    success: true
                }

            } catch (err) {
                console.log(err)
                try {
                    await pgclient.query('ROLLBACK')
                    return {
                        success: false,
                        msg: err.detail
                    }
                }
                catch (e) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        }
    }
}