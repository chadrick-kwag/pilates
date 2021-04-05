module.exports = `

type Query {
    fetch_apprentice_instructor_plans: SuccessAndApprenticePlanResult
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