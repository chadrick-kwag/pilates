module.exports = `

type Query {
    fetch_apprentice_lessons: SuccessAndApprenticeCourseResult
}

type ApprenticeLesson {
    id: Int
    starttime: String
    endtime: String
    apprentice_instructor_id: Int
    apprentice_instructor_name: String
}


type Mutation{
    create_apprentice_lesson(plan_id: Int!, starttime: String, hours:Int, apprentice_instructor_id:Int!, activity_type: String, grouping_type: String!): SuccessResult
    change_apprentice_lesson_starttime(lessonid:Int!, starttime: String): SuccessResult
}
`