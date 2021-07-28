module.exports = `

type Query {
    query_clients_by_phonenumber(phonenumber:String!): SuccessAndClientsResult
    query_checkin_lessons_of_client(clientid:Int!): SuccessAndCheckInLessonsResult
    check_token: CheckTokenResponse
}

type Mutation{
    checkin_lesson_for_client(clientid:Int!, lessonid: Int!): CheckinResponse
    get_new_token(password: String!): GetNewTokenResponse
}


type CheckTokenResponse{
    success: Boolean!
    msg: String
    is_valid: Boolean

}

type CheckinResponse{
    success: Boolean
    msg: String
}

type GetNewTokenResponse{
    success: Boolean!
    msg: String
    token: String
}



type CheckInLessons{
    id: Int!
    starttime: String!
    endtime: String!
    instructorid: Int!
    instructorname: String!
    grouping_type: String!
    activity_type: String!
}

type SuccessAndCheckInLessonsResult{
    success: Boolean
    msg: String
    lessons: [CheckInLessons]
}

type ClientInfo{
    id: Int!
    name: String
}

type SuccessAndClientsResult{

    success: Boolean
    msg: String
    clients: [ClientInfo]
}
`