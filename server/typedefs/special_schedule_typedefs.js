module.exports = `


type Mutation{
    create_special_schedule(starttime: String!, endtime: String!, title: String!, memo: String): SuccessResult
    change_special_schedule(id: Int!): SuccessResult
}
`