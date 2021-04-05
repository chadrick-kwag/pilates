module.exports = `

type Query {
    fetch_apprentice_instructors: SuccessAndApprenticeInstructorResult
    query_apprentice_instructor_by_name(name:String!): SuccessAndApprenticeInstructorResult
    fetch_apprentice_instructor_by_id(id:Int!): SuccessAndApprenticeInstructorResult
}

type SuccessAndApprenticeInstructorResult{

    success: Boolean
    msg: String
    apprenticeInstructors: [ApprenticeInstructor]
}

type ApprenticeInstructor {
    id: Int
    name: String
    gender: String
    phonenumber: String
    course_name: String
    course_id: Int
}

type Mutation{
    create_apprentice_instructor(name:String!, gender: String, phonenumber: String!, course_id: Int): SuccessResult
    update_apprentice_instructor(id:Int!, name:String!, gender:String, phonenumber: String!, course_id: Int): SuccessResult
}
`