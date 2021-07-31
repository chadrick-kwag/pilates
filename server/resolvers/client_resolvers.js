const pgclient = require('../pgclient')

const {
    incoming_time_string_to_postgres_epoch_time
} = require('./common')


module.exports = {

    Query: {

        fetch_client_stat: async (parent, args) => {
            try {
                let result = await pgclient.query(`select count(1) as totalcount from client`)

                return {
                    success: true,
                    stat: {
                        total_count: result.rows[0].totalcount
                    }
                }
            }
            catch (err) {
                return {
                    success: false,
                    msg: err.detail
                }
            }
        },

        fetch_clients: async (parent, args) => {
            let results = await pgclient.query(`select client.id as id, person.name as name, person.phonenumber, person.created, job, email, birthdate, address, person.gender, memo, disabled from client
            left join person on person.id = client.personid
            `).then(res => {

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

            if (args.name.trim() === "") {
                return []
            }

            let pattern = '%' + args.name + '%'

            try {
                let results = await pgclient.query("select * from client left join person on person.id = client.personid where name like $1", [pattern])

                return results.rows
            }
            catch (e) {
                console.log(e)
                return []
            }

        },
        query_clients_by_name: async (parent, args) => {

            try {
                let result = await pgclient.query(`select client.id,
                person.name,
                person.phonenumber,
                person.created,
                client.job,
                person.email,
                client.memo,
                client.address,
                person.gender,
                client.birthdate,
                client.disabled
                from client 
                left join person on person.id = client.personid
                where person.name=$1`, [args.name])

                return {
                    success: true,
                    clients: result.rows
                }
            }
            catch (e) {
                console.log(e)

                return {
                    success: false,
                    msg: e.detail
                }
            }


        },
        query_clientinfo_by_clientid: async (parent, args) => {


            try {
                let result = await pgclient.query(`select client.id,
                person.name,
                person.phonenumber,
                person.created,
                client.job,
                person.email,
                client.memo,
                client.address,
                person.gender,
                client.birthdate,
                client.disabled
                from client 
                left join person on person.id = client.personid
                where client.id=$1`, [args.clientid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'not one client found'
                    }
                }

                return {
                    success: true,
                    client: result.rows[0]
                }
            } catch (e) {
                console.log(e)
                return {
                    success: false,
                    msg: e.detail
                }
            }

        }
    },
    Mutation: {

        createclient: async (parent, args) => {


            let gender = null
            if (args.gender !== null) {
                if (args.gender.toLowerCase() === "male") {
                    gender = 'MALE'
                }
                else if (args.gender.toLowerCase() === "female") {
                    gender = 'FEMALE'
                }
            }

            try {
                // check if person with name, phonenumber exists. this can be done by insert into person, thanks to unique constraint
                await pgclient.query('begin')

                let result = await pgclient.query(`select id from person where name=$1 and phonenumber=$2`, [args.name, args.phonenumber])

                let personid
                if (result.rowCount === 0) {
                    let result = await pgclient.query(`insert into person(name, phonenumber, gender) ($1, $2, $3) returning id`, [args.name, args.phonenumber, gender])

                    personid = result.rows[0].id
                }
                else {
                    personid = result.rows[0].id
                }


                // create new client with personid
                result = await pgclient.query(`insert into client (job, birthdate, address, memo, personid) ($1, $2, $3, $4, $5) `, [args.job, args.birthdate, args.address, args.memo, personid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'insert error'
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

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }

        },

        disable_client_by_clientid: async (parent, args) => {

            try {
                await pgclient.query('begin')

                let result = await pgclient.query(`update client set disabled=true where id=$1`, [args.clientid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'not one client affected'
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

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }

        },

        able_client_by_clientid: async (parent, args) => {

            try {

                await pgclient.query('begin')

                let result = await pgclient.query(`update client set disabled=false where id=$1`, [args.clientid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'not one client affected'
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

                    return {
                        success: false,
                        msg: e.detail
                    }
                }
                catch (e2) {
                    return {
                        success: false,
                        msg: e.detail
                    }
                }
            }
        },

        deleteclient: async (parent, args) => {


            try {
                await pgclient.query('begin')

                let result = await pgclient.query('delete from client where id=$1 returning id', [args.id])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'no client with that id exist'
                    }
                }

                await pgclient.query('commit')

                return {
                    success: true
                }
            }
            catch (e) {
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

        update_client: async (parent, args) => {

            let gender = null
            if (args.gender != null) {
                if (args.gender.toLowerCase() == 'male') {
                    gender = 'MALE'
                }
                else if (args.gender.toLowerCase() == 'female') {
                    gender = 'FEMALE'
                }
            }

            try {
                await pgclient.query('begin')

                // update client info

                let result = await pgclient.query(`update client set job=$1, birthdate=$2, address=$3, memo=$4 where id=$5 returning personid`, [args.job, args.birthdate, args.address, args.memo, args.id])


                if (result.rowCount !== 1) {
                    throw {
                        detail: 'not one client update'
                    }
                }

                const personid = result.rows[0].personid

                result = await pgclient.query(`update person set name=$1, phonenumber=$2, gender=$3 where id=$4`, [args.name, args.phonenumber, gender, personid])

                if (result.rowCount !== 1) {
                    throw {
                        detail: 'not one person update'
                    }
                }
                await pgclient.query('commit')


                return {
                    success: true
                }
            }
            catch (e) {
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
    }

}