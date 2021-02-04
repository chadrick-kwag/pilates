module.exports=`
type Query{
    query_subscriptions_of_clientname(clientname:String): SuccessAndSubscriptions
    query_subscriptions: SuccessAndSubscriptions
    query_subscriptions_with_remainrounds_for_clientid(clientid: Int!, activity_type: String!, grouping_type: String!): ReturnSubscriptionWithRemainRounds
    query_all_subscriptions_with_remainrounds_for_clientid(clientid: Int!): ReturnAllSubscriptionsWithRemainRounds
    fetch_tickets_for_subscription_id(subscription_id: Int!): SuccessAndTickets
}

type Mutation{
    create_subscription(clientid: Int!, rounds: Int!, totalcost: Int!,  activity_type: String!, grouping_type: String!, coupon_backed: String): SuccessResult
    delete_subscription(id:Int!): SuccessResult
}
`