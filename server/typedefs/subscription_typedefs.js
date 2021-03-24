module.exports=`


type PlanAndTickets{

    planid: Int
    total_ticket_count: Int
    avail_ticket_count: Int
    avail_ticket_id_list: [Int]
}

type PlanAndTicketsResponse{

    success: Boolean!
    msg: String
    planandtickets: [PlanAndTickets]
}




type PlanDetail {
    id: Int
    clientid: Int
    clientname: String
    rounds: Int
    totalcost: Int
    created: String
    activity_type: String
    grouping_type: String
    coupon_backed: String
    tickets: [Ticket2]
}

type PlanDetailAndTicketDetailResponse{
    success: Boolean
    msg: String
    subscription_info: PlanDetail
}

type Query{
    query_subscriptions_of_clientname(clientname:String): SuccessAndSubscriptions
    query_subscriptions_by_clientid(clientid:Int!): SuccessAndSubscriptions
    query_subscriptions: SuccessAndSubscriptions
    query_subscriptions_with_remainrounds_for_clientid(clientid: Int!, activity_type: String!, grouping_type: String!): PlanAndTicketsResponse
    query_all_subscriptions_with_remainrounds_for_clientid(clientid: Int!): ReturnAllSubscriptionsWithRemainRounds
    fetch_tickets_for_subscription_id(subscription_id: Int!): SuccessAndTickets
    query_subscription_info_with_ticket_info(id:Int!): PlanDetailAndTicketDetailResponse
}

type Mutation{
    create_subscription(clientid: Int!, rounds: Int!, totalcost: Int!,  activity_type: String!, grouping_type: String!, coupon_backed: String, expiredate: String!): SuccessResult
    delete_subscription(id:Int!): SuccessResult
    transfer_tickets_to_clientid(ticket_id_list: [Int], clientid: Int!): SuccessResult
    update_expdate_of_tickets(ticket_id_list: [Int], new_expdate: String!): SuccessResult
    delete_tickets(ticketid_arr: [Int]): SuccessResult
    add_tickets(planid: Int!, addsize: Int!, expire_datetime: String!): SuccessResult
    change_plan_totalcost(planid: Int!, totalcost: Int!): SuccessResult
}
`