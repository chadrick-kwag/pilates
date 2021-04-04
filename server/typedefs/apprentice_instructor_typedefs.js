module.exports = `

type Query {
    fetch_apprentice_instructors: SuccessAndApprenticeInstructorResult
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
}

type Mutation{
    create_apprentice_instructor(name:String!, gender: String, phonenumber: String!, course_id: Int): SuccessResult
}
`