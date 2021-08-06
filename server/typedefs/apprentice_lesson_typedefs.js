module.exports = `

type Query {
    fetch_apprentice_lessons: SuccessAndApprenticeCourseResult
    fetch_apprentice_lesson_by_lessonid(lessonid: Int!): fetch_apprentice_lesson_by_lessonid_resp
}

type fetch_apprentice_lesson_by_lessonid_resp {
    success: Boolean
    msg: String
    lesson: ApprenticeLesson
}

type ApprenticeLesson {
    id: Int
    starttime: String
    endtime: String
    apprentice_instructor_id: Int
    apprentice_instructor_name: String
    apprentice_instructor_phonenumber: String
    activity_type: String
    grouping_type: String
    ticket_id_arr: [Int]
}


type Mutation{
    create_apprentice_lesson(plan_id: Int!, starttime: String, hours:Int, apprentice_instructor_id:Int!, activity_type: String, grouping_type: String!): SuccessResult
    change_apprentice_lesson_starttime(lessonid:Int!, starttime: String): SuccessResult
    cancel_apprentice_lesson(lessonid:Int!): SuccessResult
}
`