module.exports=`
type Query{
    
    fetch_instructors: SuccessAndInstructors
    
    search_instructor_with_name(name: String!): [Instructor]
    fetch_instructor_with_id(id: Int!): ResultInstructor
}

type Mutation {
    
    create_instructor(name: String!, phonenumber: String!, email: String, job: String, validation_date: String, memo: String, address: String, birthdate: String, is_apprentice: Boolean, level: String, gender: String): SuccessResult
      
    deleteinstructor(id: Int!): SuccessResult
    
    disable_instructor_by_id(id:Int!): SuccessResult
    able_instructor_by_id(id:Int!): SuccessResult
    
    update_instructor(id: Int!, name: String!, phonenumber: String!, birthdate: String, validation_date: String, memo: String, address: String, is_apprentice: Boolean, email: String, job: String, level: String, gender: String): SuccessResult
    
}
`