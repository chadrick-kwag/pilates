
const { ApolloServer, gql } = require('apollo-server');
const { Pool, Client } = require('pg')
const moment = require('moment-timezone')

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
  }

  type Instructor {
      id: String
      name: String
      phonenumber: String
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
  type Query {
    clients: [Client]
    instructors: [Instructor]
    search_client_with_name(name: String!): [Client]
    search_instructor_with_name(name: String!): [Instructor]
    query_all_lessons: [Lesson]
    query_lessons_with_daterange(start_time: String!, end_time: String!): [Lesson]
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
      createsubscription(clientid: Int!, rounds: Int!, totalcost: Int!): SuccessResult
      create_lesson(clientids:[Int!], instructorid: Int!, start_time: String!, end_time: String!): SuccessResult
      delete_lesson(lessonid:Int!): SuccessResult
      attempt_update_lesson_time(lessonid:Int!, start_time: String!, end_time: String!): SuccessResult
  }



`


const pgclient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'rootpw',
    port: 5432,
})
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


        }
    },
    Mutation: {
        createclient: async (parent, args) => {
            console.log(args)

            let ret = await pgclient.query("insert into pilates.client (name, phonenumber) values ($1, $2) returning id,name,phonenumber", [args.name, args.phonenumber]).then(res => {
                console.log(res)
                return res.rows[0]
            }).catch(err => {
                return {}
            })

            // let user = await pgclient.query("select * from pilates.client where")
            console.log("ret:")
            console.log(ret)

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
            let ret = await pgclient.query('insert into pilates.instructor (name, phonenumber) values ($1, $2)', [args.name, args.phonenumber]).then(res => {
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
        createsubscription: async (parent, args) => {

            let ret = await pgclient.query('insert into pilates.subscription(clientid, rounds, totalcost) values ($1, $2,$3)', [args.clientid, args.rounds, args.totalcost]).then(res => {
                if (res.rowCount > 0) {
                    return true
                }
                else return false
            })
                .catch(e => {
                    console.log(e)
                    return false
                })

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
                else{
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
                    msg : "overlapping lesson exist"
                }
            }


        }



    }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});