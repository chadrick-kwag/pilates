module.exports=`
type Subscription {
    id: Int
    clientid: Int
    clientname: String
    rounds: Int
    totalcost: Int
    created: String
    activity_type: String
    grouping_type: String
    coupon_backed: String
}

type Client {
    id: String!
    name: String!
    phonenumber: String!
    created: String
    job: String
    email: String
    memo: String
    address: String
    gender: String
    birthdate: String
    disabled: Boolean
  }

type Ticket {
    id: Int
    expire_time: String
    creator_subscription_id: Int
    destroyer_subscription_id: Int

}


type Ticket2 {
    id: Int
    expire_time: String
    created_date: String
    consumed_date: String
    destroyed_date: String
}

type SubscriptionInfo {
    id: Int
    created: String
}

type SubscriptionIdAndTickets {
    subscription: SubscriptionInfo
    tickets: [Ticket]
}

type RawSubscription {
    id: Int
    clientid: Int
    rounds: Int
    totalcost: Int
    created: String
    activity_type: String
    grouping_type: String
    coupon_backed: String
}

type ReturnSubscriptionWithRemainRounds {
    success: Boolean
    subscriptions: [SubscriptionIdAndTickets]
}

type SubscriptionWithRemainRounds {
    subscription: RawSubscription
    remainrounds: Int
}

type Instructor {
    id: String!
    name: String!
    phonenumber: String!
    created: String
    memo: String
    job: String
    email: String
    validation_date: String
    birthdate: String
    is_apprentice: Boolean
    level: Int
    level_string: String
    address: String
    gender: String
    disabled: Boolean
}

type SuccessAndInstructors{

  success: Boolean
  msg: String
  instructors: [Instructor]
}

type Lesson {
    id: Int
  clientid: Int
  clientname: String
  instructorid: Int
  instructorname: String
  starttime: String
  endtime: String
  activity_type: String
  grouping_type: String

}


type SuccessAndLessons {
    success: Boolean
    lessons: [Lesson]
}


type SuccessAndSubscriptions {
    success: Boolean,
    subscriptions: [Subscription]
}

type SuccessAndClients{
    success: Boolean
    msg: String
    clients: [Client]
}

type AllSubscriptionsWithRemainRounds{
  planid: Int
  total_rounds: Int
  remain_rounds: Int
  created: String
  activity_type: String
  grouping_type: String
}

type ReturnAllSubscriptionsWithRemainRounds{
    success: Boolean
    msg: String
    allSubscriptionsWithRemainRounds: [AllSubscriptionsWithRemainRounds]
    
}

type SuccessAndTickets{
    success: Boolean
    msg: String
    tickets: [Ticket2]
}


type LessonClientInfo {
    clientid: Int
    clientname: String
    clientphonenumber: String
    ticketid: Int

}



type LessonWithMoreInfo {
  id: Int
  client_info_arr: [LessonClientInfo]
  instructorid: Int
  instructorname: String
  instructorphonenumber: String
  starttime: String
  endtime: String
  activity_type: String
  grouping_type: String
}

type query_lesson_return {
    success: Boolean
    msg: String
    lessons: [LessonWithMoreInfo]
}

type ResultInstructor{
    success: Boolean,
    msg: String,
    instructor: Instructor
}

type SuccessResult {
    success: Boolean,
    msg: String
}

type SuccessWarningMsgResult{
    success: Boolean
    warning: Boolean
    msg: String
}
`