
const { ApolloServer, gql } = require('apollo-server');
const { Pool, Client } = require('pg')
const moment = require('moment-timezone');

const { postgres_access_info, graphql_server_options } = require('../config.js')



function incoming_time_string_to_postgres_epoch_time(time_str) {
    let a = new Date(time_str)
    return a.getTime() / 1000
}


function parse_incoming_gender_str(gender_str) {
    if (gender_str == null) {
        return null
    }

    let gender = null
    if (gender_str.toLowerCase() == 'male') {
        gender = 'MALE'
    }
    else if (gender_str.toLowerCase() == 'female') {
        gender = 'FEMALE'
    }

    return gender

}

function parse_incoming_date_utc_string(date_utc_str) {
    // return epoch seconds
    if (date_utc_str == null) {
        return null
    }

    return new Date(date_utc_str).getTime() / 1000


}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Client {
    id: String!
    name: String!
    phonenumber: String!
    created: String
    job: String
    email: String
    memo: String
    address: String
    gender: String
    birthdate: String
  }

  type Subscription {
      id: Int
      clientid: Int
      clientname: String
      rounds: Int
      totalcost: Int
      created: String
      activity_type: String
      grouping_type: String
      coupon_backed: String
  }

  type Ticket {
      id: Int
      expire_time: String
      creator_subscription_id: Int
      destroyer_subscription_id: Int

  }


  type Ticket2 {
      id: Int
      expire_time: String
      created_date: String
      consumed_date: String
      destroyed_date: String
  }

  type SubscriptionInfo {
      id: Int
      created: String
  }

  type SubscriptionIdAndTickets {
      subscription: SubscriptionInfo
      tickets: [Ticket]
  }

  type RawSubscription {
      id: Int
      clientid: Int
      rounds: Int
      totalcost: Int
      created: String
      activity_type: String
      grouping_type: String
      coupon_backed: String
  }

  type ReturnSubscriptionWithRemainRounds {
      success: Boolean
      subscriptions: [SubscriptionIdAndTickets]
  }

  type SubscriptionWithRemainRounds {
      subscription: RawSubscription
      remainrounds: Int
  }

  type Instructor {
      id: String!
      name: String!
      phonenumber: String!
      created: String
      memo: String
      job: String
      email: String
      validation_date: String
      birthdate: String
      is_apprentice: Boolean
      level: String
      address: String
      gender: String
  }

  type SuccessAndInstructors{

    success: Boolean
    msg: String
    instructors: [Instructor]
  }

  type Lesson {
      id: Int,
    clientid: Int,
    clientname: String,
    instructorid: Int,
    instructorname: String,
    starttime: String,
    endtime: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).

  type SuccessAndLessons {
      success: Boolean
      lessons: [Lesson]
  }


  type SuccessAndSubscriptions {
      success: Boolean,
      subscriptions: [Subscription]
  }

  type SuccessAndClients{
      success: Boolean
      msg: String
      clients: [Client]
  }

  type AllSubscriptionsWithRemainRounds{
    subscription_id: Int
    total_rounds: Int
    remain_rounds: Int
    created: String
    activity_type: String
    grouping_type: String
  }

  type ReturnAllSubscriptionsWithRemainRounds{
      success: Boolean
      msg: String
      allSubscriptionsWithRemainRounds: [AllSubscriptionsWithRemainRounds]
      
  }

  type SuccessAndTickets{
      success: Boolean
      msg: String
      tickets: [Ticket2]
  }

  type LessonWithMoreInfo {
    id: Int,
    clientid: Int,
    clientname: String,
    client_phonenumber: String,
    instructorid: Int,
    instructorname: String,
    instructor_phonenumber: String,
    starttime: String,
    endtime: String
  }

  type query_lesson_return {
      success: Boolean,
      msg: String,
      lessons: [LessonWithMoreInfo]
  }

  type ResultInstructor{
      success: Boolean,
      msg: String,
      instructor: Instructor
  }

  type Query {
    fetch_clients: SuccessAndClients
    fetch_instructors: SuccessAndInstructors
    search_client_with_name(name: String!): [Client]
    search_instructor_with_name(name: String!): [Instructor]
    query_all_lessons: [Lesson]
    query_lessons_with_daterange(start_time: String!, end_time: String!): query_lesson_return
    query_lesson_with_timerange_by_clientid(clientid: Int!, start_time: String!, end_time: String!): [Lesson]
    query_lesson_with_timerange_by_instructorid(instructorid: Int!, start_time: String!, end_time: String!): SuccessAndLessons
    query_subscriptions: SuccessAndSubscriptions
    query_subscriptions_with_remainrounds_for_clientid(clientid: Int!, activity_type: String!, grouping_type: String!): ReturnSubscriptionWithRemainRounds
    query_all_subscriptions_with_remainrounds_for_clientid(clientid: Int!): ReturnAllSubscriptionsWithRemainRounds

    fetch_tickets_for_subscription_id(subscription_id: Int!): SuccessAndTickets
    fetch_instructor_with_id(id: Int!): ResultInstructor
  }

  type SuccessResult {
      success: Boolean,
      msg: String
  }

  type Mutation{
      createclient(name: String!, phonenumber: String!, email: String, birthdate: String, memo: String, address: String, gender: String, job: String ): SuccessResult
      deleteclient(id: Int!): SuccessResult

      create_instructor(name: String!, phonenumber: String!, email: String, job: String, validation_date: String, memo: String, address: String, birthdate: String, is_apprentice: Boolean, level: String, gender: String): SuccessResult
      
      deleteinstructor(id: Int!): SuccessResult
      
      create_lesson(clientids:[Int!], instructorid: Int!, start_time: String!, end_time: String!, ticketid: Int!): SuccessResult
      delete_lesson(lessonid:Int!): SuccessResult
      delete_lesson_with_request_type(lessonid:Int!, request_type: String!): SuccessResult
      attempt_update_lesson_time(lessonid:Int!, start_time: String!, end_time: String!): SuccessResult
      update_client(id: Int!, name: String!, phonenumber: String!, address: String, job: String, birthdate: String, gender: String, memo: String, email: String): SuccessResult
      update_instructor(id: Int!, name: String!, phonenumber: String!, birthdate: String, validation_date: String, memo: String, address: String, is_apprentice: Boolean, email: String, job: String, level: String, gender: String): SuccessResult
      
      create_subscription(clientid: Int!, rounds: Int!, totalcost: Int!,  activity_type: String!, grouping_type: String!, coupon_backed: String): SuccessResult
      delete_subscription(id:Int!): SuccessResult
      create_individual_lesson(clientid: Int!, instructorid: Int!, ticketid: Int!, starttime: String!, endtime: String!): SuccessResult
      update_lesson_instructor_or_time(lessonid: Int!, start_time: String!, end_time: String!, instructor_id: Int!): SuccessResult
  }

`


const pgclient = new Client(postgres_access_info)

pgclient.connect(err => {
    if (err) {
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})


const resolvers = {
    Query: {

        fetch_tickets_for_subscription_id: async (parent, args) => {

            console.log(args)


            let result = await pgclient.query("select subscription_ticket.id, expire_time, subscription.created as created_date, \
            lesson.created as consumed_date ,\
            destroyer_subscription.created as destroyed_date\
            from pilates.subscription_ticket \
            left join pilates.subscription on subscription_ticket.creator_subscription_id = subscription.id \
            left join pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id \
            left join pilates.subscription as destroyer_subscription on subscription_ticket.destroyer_subscription_id = \ destroyer_subscription.id \
            where subscription.id=$1", [args.subscription_id]).then(res => {
                console.log(res.rows)

                return {
                    success: true,
                    tickets: res.rows
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: "query error"

                }
            })

            return result

        },

        query_all_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {

            // console.log(args)

            let result = await pgclient.query(" \
            select json_build_object('total_rounds', subscription.rounds, \
            'activity_type', subscription.activity_type, \
            'grouping_type', subscription.grouping_type, \
            'remain_rounds', A.remain_rounds, \
            'subscription_id', subscription.id, \
            'created', subscription.created) \
            from pilates.subscription left join \
            (select count(subscription_ticket.id) as total_rounds, \
            count(case when lesson.id is null then 1 else null end) as remain_rounds,  \
            subscription_ticket.creator_subscription_id as subscription_id \
            from pilates.subscription_ticket \
            left join pilates.lesson on subscription_ticket.id = lesson.consuming_client_ss_ticket_id \
            left join pilates.subscription on subscription_ticket.creator_subscription_id = subscription.id \
            where creator_subscription_id in (select id from pilates.subscription where clientid=$1 order by created) \
            group by subscription_id) as A \
             \
            on A.subscription_id=subscription.id \
            where subscription.clientid = $1 \
            order by created", [args.clientid]).then(res => {

                // console.log(res.rows)

                let json_arr = res.rows.map(d => d.json_build_object)
                // console.log(json_arr)
                return {
                    success: true,
                    allSubscriptionsWithRemainRounds: json_arr
                }
            }).catch(e => {
                console.log(e)

                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log(result)

            return result
        },
        fetch_clients: async (parent, args) => {
            let results = await pgclient.query("select id, name, phonenumber, created, job, email, birthdate, address, gender, memo from pilates.client").then(res => {

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
        fetch_instructors: async () => {
            let result = await pgclient.query("select id,name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level from pilates.instructor").then(res => {

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
        search_client_with_name: async (parent, args, context, info) => {
            console.log(args)
            let results = await pgclient.query("select * from pilates.client where name=$1", [args.name]).then(res => {
                return res.rows
            }).catch(e => [])


            return results
        },
        search_instructor_with_name: async (parent, args, context, info) => {
            let results = await pgclient.query("select * from pilates.instructor where name=$1", [args.name]).then(res => {
                return res.rows
            })
                .catch(e => [])

            return results
        },
        query_all_lessons: async (parent, args) => {

            let results = await pgclient.query("select  lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid").then(res => {
                return res.rows
            })
                .catch(e => [])

            let result = results[0]


            return results
        },
        query_lessons_with_daterange: async (parent, args) => {

            console.log("inside query_lessons_with_daterange")
            console.log(args)


            let start_time = new Date(args.start_time)
            let end_time = new Date(args.end_time)


            start_time = start_time.getTime() / 1000
            end_time = end_time.getTime() / 1000


            let results = await pgclient.query("select lesson.id as id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname,  client.phonenumber as client_phonenumber, instructor.name as instructorname, instructor.phonenumber as instructor_phonenumber from pilates.lesson \
            left join pilates.client on lesson.clientid=client.id \
            left join pilates.instructor on instructor.id=lesson.instructorid \
			where lesson.starttime > to_timestamp($1) and lesson.endtime < to_timestamp($2) and canceled_time is null", [start_time, end_time]).then(res => {

                return {
                    success: true,
                    lessons: res.rows
                }


            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"     
                }
            })


            return results


        },
        query_lesson_with_timerange_by_clientid: async (parent, args) => {
            console.log(args)

            let clientid = args.clientid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000

            console.log(start_time)
            console.log(end_time)

            let lessons = await pgclient.query("select lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid  where  lesson.clientid=$1 AND lesson.starttime >= to_timestamp($2) AND lesson.endtime <= to_timestamp($3) ", [clientid, start_time, end_time]).then(res => {
                console.log(res.rows)
                return res.rows
            }).catch(e => {
                console.log(e)
                return []
            })

            console.log(lessons)

            return lessons
        },
        query_lesson_with_timerange_by_instructorid: async (parent, args) => {
            console.log(args)

            let instructorid = args.instructorid
            let start_time = args.start_time
            let end_time = args.end_time

            start_time = new Date(start_time).getTime() / 1000
            end_time = new Date(end_time).getTime() / 1000

            let lessons = await pgclient.query("select lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid  where  lesson.instructorid=$1 AND lesson.starttime >= to_timestamp($2) AND lesson.endtime <= to_timestamp($3) ", [instructorid, start_time, end_time]).then(res => {
                return res.rows
            }).catch(e => {
                console.log(e)
                return null
            })

            if (lessons == null) {
                return {
                    success: false,
                    lessons: []
                }
            }
            else {
                return {
                    success: true,
                    lessons: lessons
                }
            }
        },
        query_subscriptions: async (parent, args) => {
            console.log(args)

            let subscriptions = await pgclient.query("select subscription.id, subscription.clientid, client.name as clientname, rounds, totalcost, subscription.created, subscription.activity_type, subscription.grouping_type, subscription.coupon_backed from pilates.subscription left join pilates.client on subscription.clientid=client.id").then(res => {
                console.log(res.rows)
                return res.rows
            }).catch(e => {
                console.log(e)
                return null
            })

            console.log(subscriptions)

            if (subscriptions == null) {
                return {
                    success: false,
                    subscriptions: []
                }
            }
            else {

                let retobj = {
                    success: true,
                    "subscriptions": subscriptions
                }
                console.log(retobj)
                return retobj
            }

        },
        query_subscriptions_with_remainrounds_for_clientid: async (parent, args) => {
            console.log(args)

            let subscriptions = await pgclient.query('select array_agg(json_build_object(\'id\',subscription_ticket.id, \'expire_time\',subscription_ticket.expire_time)), subscription_ticket.creator_subscription_id as subscription_id, subscription.created  from pilates.subscription_ticket \
             LEFT JOIN pilates.lesson ON subscription_ticket.id = lesson.consuming_client_ss_ticket_id  LEFT JOIN pilates.subscription ON subscription_ticket.creator_subscription_id = subscription.id where  destroyer_subscription_id is null and expire_time > now() and lesson.id is null and \
              creator_subscription_id in ( select id from pilates.subscription where clientid=$1 and activity_type=$2 and grouping_type=$3) GROUP BY subscription_ticket.creator_subscription_id, subscription.created', [args.clientid, args.activity_type, args.grouping_type]).then(res => {

                let ret_arr = []



                res.rows.forEach(d => {
                    let item_arrs = d.array_agg
                    //   console.log(item_arrs)

                    let subscription_info = {
                        id: d.subscription_id,
                        created: d.created
                    }

                    ret_arr.push({
                        subscription: subscription_info,
                        tickets: item_arrs
                    })
                })

                return ret_arr
            }).catch(e => {
                console.log(e)
                return null
            })

            if (subscriptions == null) {
                return {
                    success: false
                }
            }



            return {
                success: true,
                subscriptions: subscriptions
            }

        },
        fetch_instructor_with_id: async (parent, args)=>{

            console.log("inside fetch instructor with id")

            console.log(args)

            let result = await pgclient.query('select id,name,phonenumber, created, is_apprentice, birthdate, validation_date, memo, job, address, email, gender, level from pilates.instructor where id=$1', [args.id]).then(res=>{
                return {
                    success: true,
                    instructor: res.rows[0]
                }
            }).catch(e=>{
                console.log(e)
                return {
                    success: false,
                    msg: "query erro"
                }
            })

            return result
        }
    },
    Mutation: {
        update_lesson_instructor_or_time: async (parent, args)=>{
            console.log('inside update lesson instructor or time')
            console.log(args)

            let result = await pgclient.query('select func1($1,$2,$3,$4)',[args.lessonid, args.instructor_id, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time)]).then(res=>{
                return res.rows[0].func1;
            })
            .catch(e=>{
                console.log(e)

                return {
                    success: false,
                    msg: 'query error'
                }
            })

            console.log(result)

            return result
        },
        createclient: async (parent, args) => {
            console.log(args)

            let gender = null
            if (args.gender.toLowerCase() == "male") {
                gender = 'MALE'
            }
            else if (args.gender.toLowerCase() == "female") {
                gender = 'FEMALE'
            }

            let birthdate = null
            if (args.birthdate) {
                birthdate = incoming_time_string_to_postgres_epoch_time(args.birthdate)
            }

            let pre_args = [args.name, args.phonenumber, gender, args.job, args.address, args.memo, args.email, birthdate]

            console.log(pre_args)

            let ret = await pgclient.query("insert into pilates.client (name, phonenumber, gender, job, address, memo, email, birthdate) values ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8))", [args.name, args.phonenumber, gender, args.job, args.address, args.memo, args.email, incoming_time_string_to_postgres_epoch_time(args.birthdate)]).then(res => {
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
                return {
                    success: false,
                    msg: 'error inserting query'
                }
            })

            // let user = await pgclient.query("select * from pilates.client where")

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
        create_instructor: async (parent, args) => {

            console.log(args)

            let _args = [args.name, args.phonenumber, parse_incoming_gender_str(args.gender), args.email, args.job, parse_incoming_date_utc_string(args.validation_date), args.is_apprentice, args.memo, args.address, parse_incoming_date_utc_string(args.birthdate), args.level]

            console.log(_args)

            let ret = await pgclient.query('insert into pilates.instructor (name, phonenumber, gender, email, job, validation_date, is_apprentice, memo, address, birthdate, level) values ($1, $2, $3, $4, $5, to_timestamp($6), $7, $8, $9, to_timestamp($10), $11)', _args).then(res => {
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


        create_lesson: async (parent, args) => {
            console.log(args)

            let _args = [args.clientid, args.instructorid, parse_incoming_date_utc_string(args.start_time), parse_incoming_date_utc_string(args.end_time), args.ticketid]

            console.log(_args)

            let result = await pgclient.query("insert into pilates.lesson clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id values ($1, $2, $3, $4, $5) where not exists( \
                select 1 from pilates.lesson where  (clientid=$1 or instructorid=$2) \
                AND (tstzrange(to_timestamp($3), to_timestamp($4)) \
                     && tstzrange(lesson.starttime, lesson.endtime)) \
                     and predecessor_id is null \
                     ) and exists (select 1 from pilates.subscription_ticket where id=$5 and expire_time > now() and destroyer_subscription_id is not null)", _args).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return {
                        success: true

                    }
                }
                else {
                    return {
                        success: false,
                        msg: 'failed to insert query'
                    }
                }
            })
                .catch(e => {

                    console.log(e)
                    return {
                        success: false,
                        msg: "error query"
                    }
                })

            return result
        },

        delete_lesson: async (parent, args) => {
            console.log("delete_lesson")
            console.log(args)

            let lessonid = args.lessonid

            let ret = await pgclient.query("update pilates.lesson set cancel_type='BUFFERED_CLIENT_REQ_CANCEL', canceled_time=now() where id=$1", [lessonid]).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return {
                        success: true
                        
                    }
                }

                return {
                    success: false,
                    msg: "query failed"
                }
            }).catch(e => {
                console.log(e)
                return {
                    success: false,
                    msg: "query error"
                }
            })
            

            console.log(ret)

            return ret
        },
        attempt_update_lesson_time: async (parent, args) => {
            console.log(args)

            // first check if there are any colliding schedules
            // for checking collision, the instructor should not have overlapping timeslot
            // also, the client should not have overlapping timeslot as well.

            // get client id and instructor id of lessionid

            let info_res = await pgclient.query('select clientid, instructorid from pilates.lesson where id=$1', [args.lessonid]).then(res => {
                console.log('search client and instructor id info')
                console.log(res.rows)

                if (res.rowCount > 0) {
                    return res.rows[0]
                }
                else {
                    return null
                }
            }).catch(e => {
                console.log(e)
                return null
            })

            if (info_res == null) {
                // failed to get basic info of lesson id

                return {
                    success: false,
                    msg: "no lesson with lesson id found"
                }
            }

            let clientid = info_res.clientid
            let instructorid = info_res.instructorid


            let start_time = new Date(args.start_time).getTime() / 1000
            let end_time = new Date(args.end_time).getTime() / 1000



            let overlapping_lessons = await pgclient.query('select * from pilates.lesson where tstzrange(to_timestamp($1), to_timestamp($2)) && tstzrange(lesson.starttime, lesson.endtime) AND (clientid=$3 OR instructorid=$4) AND id!=$5 ', [start_time, end_time, clientid, instructorid, args.lessonid]).then(res => {

                // console.log("overlapping lesson search result")
                // console.log(res.rows)

                return res.rows
            })
                .catch(e => {
                    console.log(e)
                    return []
                })

            if (overlapping_lessons.length == 0) {
                // there are no overlapping lessons. it is okay to update the lesson

                let update_res = await pgclient.query('update pilates.lesson set starttime=to_timestamp($1), endtime=to_timestamp($2) where id=$3', [start_time, end_time, args.lessonid]).then(res => {
                    console.log('update row result')
                    console.log(res.rows)

                    if (res.rowCount > 0) {
                        return true
                    }
                    return false
                }).catch(e => {
                    console.log(e)
                    return false
                })

                if (update_res) {
                    return {
                        success: update_res
                    }
                }
                else {
                    // when failed
                    return {
                        success: update_res,
                        msg: "update operation failed"
                    }
                }

            }
            else {
                // there are overlapping lessons. return false

                return {
                    success: false,
                    msg: "overlapping lesson exist"
                }
            }


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
        create_subscription: async (parent, args) => {
            console.log(args)

            if (args.rounds <= 0) {
                return {
                    success: false
                }
            }

            let ret = await pgclient.query('insert into pilates.subscription (clientid, rounds, totalcost, activity_type, grouping_type, coupon_backed) values ($1,$2,$3, $4, $5, $6) RETURNING id', [args.clientid, args.rounds, args.totalcost, args.activity_type, args.grouping_type, args.coupon_backed == "" ? null : args.coupon_backed]).then(res => {
                if (res.rowCount > 0) {
                    console.log(res)

                    return [true, res.rows[0].id]
                }
                return [false, null]
            }).catch(e => {
                console.log(e)
                return [false, null]
            })

            let [retbool, created_id] = ret
            if (!retbool) {
                return {
                    success: false
                }
            }

            // // create tickets



            let value_str = ""

            let expiredate = new Date()

            expiredate.setDate(expiredate.getDate() + 30)





            for (let i = 0; i < args.rounds; i++) {
                // order::  expire_time, creator_ssid

                let temp_value_str = `(to_timestamp(${expiredate.getTime() / 1000}), ${created_id})`
                value_str += temp_value_str
                if (i < args.rounds - 1) {
                    value_str += ','
                }
            }

            console.log(value_str)


            ret = await pgclient.query(`insert into pilates.subscription_ticket (expire_time, creator_subscription_id) values ${value_str}`).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }

                return false
            })
                .catch(e => {
                    console.log(e)
                    return false
                })

            // if failed to create tickets, we must remove created subscription

            if (!ret) {
                let delete_ret = await pgclient.query('delete from pilates.subscription where id=$1', [created_id]).then(res => {
                    if (res.rowCount > 0) {
                        return true
                    }
                    return false
                }).catch(e => {
                    console.log(e)
                    return false
                })

                if (!delete_ret) {
                    console.warn("inconsistency occured. failed to delete half created subscription. subscription id = " + created_id)
                }
            }

            return {
                success: ret
            }
        },
        delete_subscription: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query('delete from pilates.subscription where id=$1', [args.id]).then(res => {
                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => {
                console.log(e)
                return false
            })


            return {
                success: ret
            }
        },
        delete_lesson_with_request_type: async (parent, args)=>{
            console.log('inside delete_lesson_with_request_type')

            console.log(args)

            let current_time = new Date()

            let request_type = args.request_type

            let lesson_start_time = await pgclient.query('select starttime from pilates.lesson where id=$1',[args.lessonid]).then(res=>{
                if(res.rowCount ==0){
                    return null
                }

                return res.rows[0].starttime
            }).catch(e=>{
                console.log(e)
                return null
            })

            if(lesson_start_time==null){
                return {
                    success: false,
                    msg: "failed to check start time of lesson"
                }
            }

            lesson_start_time = moment(lesson_start_time)

            console.log("current time")
            console.log(current_time)

            console.log("start time")
            console.log(lesson_start_time)



            let time_delta = lesson_start_time - current_time
            time_delta /= 1000   // convert to seconds

            console.log('time delta: ' + time_delta)

            // check if the current date is day before start time
            
            let start_time_zero_hour = moment(lesson_start_time)
            start_time_zero_hour.set({
                hours: 0
            })

            console.log("start_time_zero_hour")
            console.log(start_time_zero_hour)

            let is_current_date_before_start_time_date = current_time < start_time_zero_hour ? true: false

            console.log("is_current_date_before_start_time_date")
            console.log(is_current_date_before_start_time_date)

            if(request_type == "ADMIN_REQUEST"){



                let result = await pgclient.query('update pilates.lesson set cancel_type=\'ADMIN_CANCEL\', canceled_time=now() where id=$1',[ args.lessonid ]).then(res=>{
                    if(res.rowCount==0){
                        return {
                            success: false,
                            msg: "no lesson found matching lessonid"
                        }
                    }

                    return {
                        success: true
                    }
                })
                .catch(e=>{
                    console.log(e)

                    return {
                        success: false,
                        msg: "query error updating"
                    }
                })

                return result
            }
            else if(time_delta < 2 * 3600 ){
                return {
                    success: false,
                    msg: "minimum time window closed"
                }
            }
            else if(!is_current_date_before_start_time_date){
                return {
                    success: true,
                    msg: "penalized change"
                }
            }
            else{
                return {
                    success: true,
                    msg: "no penalized change"
                }
            }


        },
        create_individual_lesson: async (parent, args) => {
            console.log('inside create individual lesson')
            console.log(args)

            // check that ticket's owner matches given client id

            let client_check = await pgclient.query('select subscription.clientid from pilates.subscription_ticket left join pilates.subscription on subscription_ticket.creator_subscription_id=subscription.id where subscription_ticket.id=$1', [args.ticketid]).then(res => {
                console.log(res)

                if (res.rowCount == 0) {
                    return false
                }

                if (res.rows[0].clientid == args.clientid) {
                    return true
                }

                return false

            })

            if (!client_check) {
                return {
                    success: false,
                    msg: 'client id and ticket owner does not match'
                }
            }

            // now create lesson

            console.log(incoming_time_string_to_postgres_epoch_time(args.starttime))
            console.log(incoming_time_string_to_postgres_epoch_time(args.endtime))

            let res = await pgclient.query('insert into pilates.lesson (clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) select $1, $2, to_timestamp($3), to_timestamp($4), $5 where not exists ( select * from pilates.lesson where (lesson.clientid=$1 or lesson.instructorid=$2) and ( tstzrange(to_timestamp($3), to_timestamp($4)) && tstzrange(lesson.starttime, lesson.endtime) ) )', [args.clientid, args.instructorid, incoming_time_string_to_postgres_epoch_time(args.starttime), incoming_time_string_to_postgres_epoch_time(args.endtime), args.ticketid]).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }
                return false
            }).catch(e => {
                console.log(e)
                return false
            })


            if (res) {
                return {
                    success: true,

                }

            }
            else {
                return {
                    success: false,
                    msg: 'failed to create lesson. possibly time overlap'
                }
            }

        }

    }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});