
const { ApolloServer, gql } = require('apollo-server');
const { Pool, Client } = require('pg')
const moment = require('moment-timezone');

const {postgres_access_info, graphql_server_options} = require('../config.js')



function incoming_time_string_to_postgres_epoch_time(time_str){
    let a= new Date(time_str)
    return a.getTime()/1000
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Client {
    id: String
    name: String
    phonenumber: String
    created: String
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
      id: String
      name: String
      phonenumber: String
      created: String
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
      success: Boolean,
      lessons: [Lesson]
  }


  type SuccessAndSubscriptions {
      success: Boolean,
      subscriptions: [Subscription]
  }

  type Query {
    clients: [Client]
    instructors: [Instructor]
    search_client_with_name(name: String!): [Client]
    search_instructor_with_name(name: String!): [Instructor]
    query_all_lessons: [Lesson]
    query_lessons_with_daterange(start_time: String!, end_time: String!): [Lesson]
    query_lesson_with_timerange_by_clientid(clientid: Int!, start_time: String!, end_time: String!): [Lesson]
    query_lesson_with_timerange_by_instructorid(instructorid: Int!, start_time: String!, end_time: String!): SuccessAndLessons
    query_subscriptions: SuccessAndSubscriptions
    query_subscriptions_with_remainrounds_for_clientid(clientid: Int!, activity_type: String!, grouping_type: String!): ReturnSubscriptionWithRemainRounds
  }

  type SuccessResult {
      success: Boolean,
      msg: String
  }

  type Mutation{
      createclient(name: String!, phonenumber: String!): Client
      deleteclient(id: Int!): SuccessResult
      createinstructor(name: String!, phonenumber: String!): SuccessResult
      deleteinstructor(id: Int!): SuccessResult
      
      create_lesson(clientids:[Int!], instructorid: Int!, start_time: String!, end_time: String!): SuccessResult
      delete_lesson(lessonid:Int!): SuccessResult
      attempt_update_lesson_time(lessonid:Int!, start_time: String!, end_time: String!): SuccessResult
      update_client(id: Int!, name: String!, phonenumber: String!): SuccessResult
      update_instructor(id: Int!, name: String!, phonenumber: String!): SuccessResult
      create_subscription(clientid: Int!, rounds: Int!, totalcost: Int!,  activity_type: String!, grouping_type: String!, coupon_backed: String): SuccessResult
      delete_subscription(id:Int!): SuccessResult
      create_individual_lesson(clientid: Int!, instructorid: Int!, ticketid: Int!, starttime: String!, endtime: String!): SuccessResult
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
        clients: async () => {
            let results = await pgclient.query("select * from pilates.client").then(res => {
                return res.rows
            }).catch(e => {
                return []
            })

            return results
        },
        instructors: async () => {
            let results = await pgclient.query("select * from pilates.instructor").then(res => {
                return res.rows
            }).catch(e => [])

            return results
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
            console.log(args)


            let start_time = new Date(args.start_time)
            let end_time = new Date(args.end_time)


            start_time = start_time.getTime() / 1000
            end_time = end_time.getTime() / 1000


            let results = await pgclient.query("select lesson.id, lesson.clientid, lesson.instructorid, lesson.starttime, lesson.endtime, client.name as clientname, instructor.name as instructorname from pilates.lesson left join pilates.client on lesson.clientid=client.id left join pilates.instructor on instructor.id=lesson.instructorid where lesson.starttime > to_timestamp($1) and lesson.endtime < to_timestamp($2)", [start_time, end_time]).then(res => {

                return res.rows


            }).catch(e => {
                return []
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

        }
    },
    Mutation: {
        createclient: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query("insert into pilates.client (name, phonenumber, created) values ($1, $2, now()) returning id,name,phonenumber", [args.name, args.phonenumber]).then(res => {
                console.log(res)
                return res.rows[0]
            }).catch(err => {
                return {}
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
        createinstructor: async (parent, args) => {
            console.log('inside create instructor')
            let ret = await pgclient.query('insert into pilates.instructor (name, phonenumber, created) values ($1, $2, now())', [args.name, args.phonenumber]).then(res => {
                if (res.rowCount > 0) return true

                return false
            }).catch(e => false)

            return { success: ret }

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

            let start_time = args.start_time
            let end_time = args.end_time

            console.log(start_time.toString())
            console.log(end_time.toString())

            start_time = new Date(start_time)
            console.log("raw date start_time")
            console.log(start_time)

            end_time = new Date(end_time)
            // end_time = get_postgres_timestamp_format(end_time)

            let start_unixtime = start_time.getTime() / 1000 // dict milisecond info
            let end_unixtime = end_time.getTime() / 1000

            // check if no overlapping lessons exist
            for (let i = 0; i < args.clientids.length; i++) {
                let clientid = args.clientids[i]
                let overlap_exist = await pgclient.query("select * from pilates.lesson where (clientid=$1 or instructorid=$2) AND (tstzrange(to_timestamp($3), to_timestamp($4)) && tstzrange(lesson.starttime, lesson.endtime))", [clientid, args.instructorid, start_unixtime, end_unixtime]).then(res => {
                    if (res.rowCount > 0) {
                        return true
                    }
                    return false
                }).catch(e => {
                    console.log(e)
                    return null
                })

                if (overlap_exist == null) {
                    return {
                        success: false
                    }
                }

                if (overlap_exist) {
                    return {
                        success: false
                    }
                }

            }


            let value_string_arr = []

            args.clientids.forEach(cid => {
                let value_string = "(" + cid + "," + args.instructorid + ",to_timestamp(" + start_unixtime + "),to_timestamp(" + end_unixtime + "))"
                value_string_arr.push(value_string)
            })

            console.log(value_string_arr)


            let query_str = "insert into pilates.lesson(clientid, instructorid, starttime, endtime) values "

            value_string_arr.forEach(s => {
                query_str = query_str + s + " "
            })

            console.log(query_str)

            let ret = await pgclient.query(query_str).then(res => {

                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => {
                console.log(e)
                return false
            })


            return { success: ret }
        },
        delete_lesson: async (parent, args) => {
            console.log(args)

            let lessonid = args.lessonid

            let ret = await pgclient.query('delete from pilates.lesson where id=$1', [lessonid]).then(res => {
                console.log(res)

                if (res.rowCount > 0) {
                    return true
                }

                return false
            }).catch(e => false)

            return {
                success: ret
            }
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

            let ret = await pgclient.query('update pilates.client set name=$1, phonenumber=$2 where id=$3', [args.name, args.phonenumber, args.id]).then(res => {
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
        update_instructor: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query('update pilates.instructor set name=$1, phonenumber=$2 where id=$3', [args.name, args.phonenumber, args.id]).then(res => {
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
        create_individual_lesson: async (parent, args)=>{
            console.log('inside create individual lesson')
            console.log(args)

            // check that ticket's owner matches given client id

            let client_check = await pgclient.query('select subscription.clientid from pilates.subscription_ticket left join pilates.subscription on subscription_ticket.creator_subscription_id=subscription.id where subscription_ticket.id=$1',[args.ticketid]).then(res=>{
                console.log(res)

                if(res.rowCount==0){
                    return false
                }

                if(res.rows[0].clientid==args.clientid){
                    return true
                }

                return false

            })

            if(!client_check){
                return {
                    success: false,
                    msg: 'client id and ticket owner does not match'
                }
            }

            // now create lesson

            let res = await pgclient.query('insert into pilates.lesson(clientid, instructorid, starttime, endtime, consuming_client_ss_ticket_id) values ($1, $2, to_timestamp($3), to_timestamp($4), $5) ',[args.clientid, args.instructorid, incoming_time_string_to_postgres_epoch_time(args.starttime), incoming_time_string_to_postgres_epoch_time(args.endtime), args.ticketid]).then(res=>{
                console.log(res)

                if(res.rowCount>0){
                    return true
                }
                return false
            }).catch(e=>{
                console.log(e)
                return false
            })


            if(res){
                return {
                    success: true,
                    
                }

            }
            else{
                return {
                    success: false,
                    msg: 'failed to create lesson'
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