module.exports = `

type Query {
    fetch_apprentice_instructor_plans: SuccessAndApprenticePlanResult
    fetch_apprentice_plan_by_id(id:Int!): SuccessAndApprenticePlanResult
    fetch_apprentice_tickets_of_plan(id:Int!): SuccessAndApprenticeTicketResult
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

type Mutation{
    create_apprentice_plan(apprentice_instructor_id: Int!, totalcost: Int!, rounds: Int!, activity_type: String, grouping_type: String): SuccessResult
}
`