module.exports = `

type Query {
    fetch_clients: SuccessAndClients
    search_client_with_name(name: String!): [Client]
    query_clients_by_name(name: String!): SuccessAndClients
}


type Mutation{
    createclient(name: String!, phonenumber: String!, email: String, birthdate: String, memo: String, address: String, gender: String, job: String ): SuccessResult
    deleteclient(id: Int!): SuccessResult
    update_client(id: Int!, name: String!, phonenumber: String!, address: String, job: String, birthdate: String, gender: String, memo: String, email: String): SuccessResult
    disable_client_by_clientid(clientid:Int!): SuccessResult
    able_client_by_clientid(clientid:Int!): SuccessResult
}
`