module.exports = `

type Query {
    fetch_apprentice_courses: SuccessAndApprenticeCourseResult
}

type SuccessAndApprenticeCourseResult{

    success: Boolean
    msg: String
    courses: [ApprenticeCourse]
}

type ApprenticeCourse {
    id: Int
    name: String
}

type Mutation{
    create_apprentice_course(name:String!): SuccessResult
}
`