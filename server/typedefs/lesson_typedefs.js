module.exports = `
type Query{

    query_all_lessons: [Lesson]
    query_lessons_with_daterange(start_time: String!, end_time: String!): query_lesson_return
    query_lesson_with_timerange_by_clientid(clientid: Int!, start_time: String!, end_time: String!): query_lesson_return
    query_lesson_with_timerange_by_instructorid(instructorid: Int!, start_time: String!, end_time: String!): query_lesson_return


}


type LessonDeleteResponse{

    success: Boolean
    penalty_warning: Boolean
    msg: String
}

type Mutation{

    create_lesson(clientids:[Int!], instructorid: Int!, starttime: String!, endtime: String!, ticketids: [Int!]): SuccessResult
    delete_lesson(lessonid:Int!): SuccessResult
    delete_lesson_with_request_type(lessonid:Int!, request_type: String!, ignore_warning: Boolean!): LessonDeleteResponse
    attempt_update_lesson_time(lessonid:Int!, start_time: String!, end_time: String!): SuccessResult
    update_lesson_instructor_or_time(lessonid: Int!, start_time: String!, end_time: String!, instructor_id: Int!): SuccessResult
    create_individual_lesson(clientid: Int!, instructorid: Int!, ticketid: Int!, starttime: String!, endtime: String!): SuccessResult
}
`

