module.exports = `

type Query {
    fetch_clients: SuccessAndClients
    search_client_with_name(name: String!): [Client]
    query_clients_by_name(name: String!): SuccessAndClients
    query_clientinfo_by_clientid(clientid: Int!): SuccessAndClient
    fetch_client_stat: SuccessAndClientStatResult
}

type ClientStatResult{
    total_count: Int
    
}

type SuccessAndClientStatResult{
    success: Boolean
    msg: String
    stat: ClientStatResult
}

type SuccessAndClient{
    success: Boolean
    msg: String
    client: Client
}


type Mutation{
    createclient(name: String!, phonenumber: String!, email: String, birthdate: String, memo: String, address: String, gender: String, job: String ): SuccessResult
    deleteclient(id: Int!): SuccessResult
    update_client(id: Int!, name: String!, phonenumber: String!, address: String, job: String, birthdate: String, gender: String, memo: String, email: String): SuccessResult
    disable_client_by_clientid(clientid:Int!): SuccessResult
    able_client_by_clientid(clientid:Int!): SuccessResult
}
`