module.exports = `

type Query {
    fetch_apprentice_instructor_plans: SuccessAndApprenticePlanResult
    fetch_apprentice_plan_by_id(id:Int!): SuccessAndApprenticePlanResult
    fetch_apprentice_tickets_of_plan(id:Int!): SuccessAndApprenticeTicketResult
    fetch_apprentice_plans_of_apprentice_instructor_and_agtype(apprentice_instructor_id:Int!, activity_type:String!, grouping_type:String!): SuccessAndApprenticePlanWithRemainRoundsResult

    fetch_apprentice_plans_of_apprentice_instructor(appinst_id: Int!): SuccessAndApprenticePlanWithRemainRoundsResult
}

type Mutation{
    create_apprentice_plan(apprentice_instructor_id: Int!, totalcost: Int!, rounds: Int!, activity_type: String, grouping_type: String, expiretime: String!): SuccessResult
    add_apprentice_tickets_to_plan(id:Int!, amount:Int!): SuccessResult
    change_expire_time_of_apprentice_tickets(id_arr:[Int!], new_expire_time: String!): SuccessResult
    transfer_apprentice_tickets_to_apprentice(id_arr:[Int!], apprentice_id: Int!): SuccessResult
    delete_apprentice_tickets(id_arr:[Int!]): SuccessResult
}

type SuccessAndApprenticeTicketResult{
    success: Boolean
    msg: String
    tickets: [ApprenticeTicket]
}

type ApprenticeTicket{
    id: Int
    expire_time: String
    consumed_time: String
}

type SuccessAndApprenticePlanResult{

    success: Boolean
    msg: String
    plans: [ApprenticePlan]
}

type SuccessAndApprenticePlanWithRemainRoundsResult{
    success: Boolean
    msg: String
    plans: [ApprenticePlanWithRemainRounds]
}

type ApprenticePlan {
    id: Int
    apprentice_instructor_name: String
    apprentice_instructor_id: Int
    apprentice_instructor_phonenumber: String
    activity_type: String
    grouping_type: String
    created: String
    totalcost: Int
    rounds: Int
}

type ApprenticePlanWithRemainRounds {
    id: Int
    apprentice_instructor_name: String
    apprentice_instructor_id: Int
    apprentice_instructor_phonenumber: String
    activity_type: String
    grouping_type: String
    created: String
    totalcost: Int
    rounds: Int
    remainrounds: Int
}


`