module.exports = `
type Query{

    query_all_lessons: [Lesson]
    query_lessons_with_daterange(start_time: String!, end_time: String!): query_lesson_return
    query_lesson_with_timerange_by_clientid(clientid: Int!, start_time: String!, end_time: String!): query_lesson_return
    query_lesson_with_timerange_by_instructorid(instructorid: Int!, start_time: String!, end_time: String!): query_lesson_return

    query_lesson_data_of_instructorid(instructorid: Int!, search_starttime:String!, search_endtime: String!): query_stat_lesson_return
    query_lesson_detail_with_lessonid(lessonid:Int!): query_lesson_detail_return
}


type TicketInfo {
    ticketid: Int
}

type ClientTickets {
    clientid: Int
    clientname: String
    clientphonenumber: String
    tickets: [TicketInfo]
}

type LessonDetail {
    id: Int
    starttime: String
    endtime: String
    activity_type: String
    grouping_type: String
    client_tickets: [ClientTickets]
}

type query_lesson_detail_return{
    success: Boolean
    msg: String
    detail: LessonDetail
}

type LessonWithMoreInfo {
    id: Int
    lesson_domain: String
    indomain_id: Int
    client_info_arr: [LessonClientInfo]
    instructorid: Int
    instructorname: String
    instructorphonenumber: String
    starttime: String
    endtime: String
    activity_type: String
    grouping_type: String
  }
  
type query_lesson_return {
    success: Boolean
    msg: String
    lessons: [LessonWithMoreInfo]
}

type stat_lesson_client_info {
    id: Int
    name: String
    phonenumber: String
}

type stat_lesson_info {
    id: Int
    starttime: String
    endtime: String
    activity_type: String
    grouping_type: String
    client_info_arr : [stat_lesson_client_info]
    totalcost: Int
    canceled_time: String
    cancel_type: String
}

type query_stat_lesson_return {
    success: Boolean
    errcode: Int
    msg: String
    lesson_info_arr: [stat_lesson_info]
}

type LessonDeleteResponse{

    success: Boolean
    penalty_warning: Boolean
    msg: String
}



type Mutation{

    create_lesson(instructorid: Int!, starttime: String!, endtime: String!, ticketids: [Int!], activity_type:String!, grouping_type: String!): SuccessResult
    cancel_individual_lesson(lessonid: Int!, clientid: Int!, reqtype:String! force_penalty: Boolean!): SuccessWarningMsgResult
    delete_lesson(lessonid:Int!): SuccessResult
    delete_lesson_with_request_type(lessonid:Int!, request_type: String!, ignore_warning: Boolean!): LessonDeleteResponse
    attempt_update_lesson_time(lessonid:Int!, start_time: String!, end_time: String!): SuccessResult
    update_lesson_instructor_or_time(lessonid: Int!, start_time: String!, end_time: String!, instructor_id: Int!): SuccessResult
    create_individual_lesson(clientid: Int!, instructorid: Int!, ticketid: Int!, starttime: String!, endtime: String!): SuccessResult
    change_clients_of_lesson(ticketid_arr: [Int], lessonid: Int!): SuccessResult

    change_lesson_overall(lessonid: Int!, client_tickets: [clientTickets!], instructorid: Int!, starttime: String!, endtime: String!): SuccessResult
    
}

input clientTickets{
    clientid: Int!
    tickets: [Int!]
}
`

