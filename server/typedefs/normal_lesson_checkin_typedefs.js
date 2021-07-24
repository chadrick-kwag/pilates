module.exports = `

type Query {
    query_clients_by_phonenumber(phonenumber:String!): SuccessAndClientsResult
    query_checkin_lessons_of_client(clientid:Int!): SuccessAndCheckInLessonsResult
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