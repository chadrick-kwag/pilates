import { gql } from '@apollo/client'


const FETCH_LESSON_GQL = gql`query {
    query_all_lessons{
        id,
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
    }
}`


const CREATE_LESSON_GQL = gql`mutation createlesson($clientids:[Int!], $instructorid:Int!, $starttime: String!, $endtime:String!){
    create_lesson(clientids: $clientids, instructorid: $instructorid, start_time: $starttime, end_time: $endtime){
        success
    }
}`

const CREATE_INDIVIDUAL_LESSON_GQL = gql`mutation create_individual_lesson($clientid: Int!, $instructorid: Int!, $starttime: String!, $endtime: String!, $ticketid: Int!){
    create_individual_lesson(clientid: $clientid, instructorid: $instructorid, ticketid: $ticketid, starttime: $starttime, endtime: $endtime ){
        success
        msg
    }

}`


const UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL = gql`mutation update_lesson($lessonid: Int!, $start_time: String!, $end_time: String!, $instructor_id: Int!){
    update_lesson_instructor_or_time(lessonid: $lessonid, start_time: $start_time, end_time: $end_time, instructor_id: $instructor_id){
        success
        msg

    }
}`

const DELETE_LESSON_GQL = gql`mutation deletelesson($lessonid:Int!){
    delete_lesson(lessonid:$lessonid){
        success
        msg
    }
}`


const DELETE_LESSON_WITH_REQUEST_TYPE_GQL = gql`mutation delete_lesson_with_request_type($lessonid: Int!, $request_type: String!, $ignore_warning: Boolean!){
    delete_lesson_with_request_type(lessonid: $lessonid, request_type: $request_type, ignore_warning: $ignore_warning){
        success
        penalty_warning
        msg
    }
}
`


const QUERY_LESSON_WITH_DATERANGE_GQL = gql`query($start_time: String!, $end_time: String!){
    query_lessons_with_daterange(start_time: $start_time, end_time: $end_time){
        success,
        msg,
        lessons {
            id
            clientid
            clientname
            client_phonenumber
            instructorid
            instructorname
            instructor_phonenumber
            starttime
            endtime
            activity_type
            grouping_type

        }
        
    }
}`


const ATTEMPT_UPDATE_SCHEDULE_TIME_GQL = gql`mutation blah($lessonid: Int!, $start_time: String!, $end_time: String!){
    attempt_update_lesson_time(lessonid:$lessonid, start_time: $start_time, end_time: $end_time){
        success,
        msg
    }
}`

const QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL = gql`query($clientid: Int!, $start_time: String!, $end_time: String!){
    query_lesson_with_timerange_by_clientid(clientid: $clientid, start_time: $start_time, end_time: $end_time){
        success
        lessons{
            id
            clientid
            clientname
            instructorid
            instructorname
            starttime
            endtime
            activity_type
            grouping_type
        }
    }
}`

const QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL = gql`query($instructorid: Int!, $start_time: String!, $end_time: String!){
    query_lesson_with_timerange_by_instructorid(instructorid: $instructorid, start_time: $start_time, end_time: $end_time){
        success
        lessons{
            id
            clientid
            clientname
            instructorid
            instructorname
            starttime
            endtime
            activity_type
            grouping_type
        }
        
    }
}`

const FETCH_CLIENTS_GQL = gql`{
    
    fetch_clients{

        success
        clients{
            id
            name
            phonenumber
            created
            job
            gender
            email
            address
            memo
            birthdate
            disabled
        }
        
    }
}`

const DELETE_CLIENT_GQL = gql`mutation DeleteClient($id:Int!){
    deleteclient(id: $id){
        success
    }
}`


const UPDATE_CLIENT_INFO_GQL = gql`mutation updateclient($id: Int!, $name: String!, $phonenumber: String!, $gender:String, $address: String, $email: String, $memo: String, $birthdate: String, $job: String){
    update_client(id: $id, name: $name, phonenumber: $phonenumber, gender: $gender, email: $email, job: $job, memo: $memo, address: $address, birthdate: $birthdate){
        success
        msg
    }
}`


const LIST_INSTRUCTOR_GQL = gql`query instructors{
    fetch_instructors{
        success
        msg
        instructors{
            id
            name
            phonenumber
            created
            job
            memo
            address
            level
            validation_date
            gender
            email
            birthdate
            is_apprentice
            disabled
        }
        

    }
} `


const DISABLE_INSTURCTOR_BY_ID = gql`
    mutation($id:Int!){
        disable_instructor_by_id(id: $id){
            success
            msg
        }
    }
`

const ABLE_INSTRUCTOR_BY_ID = gql`
    mutation($id: Int!){
        able_instructor_by_id(id:$id){
            success
            msg
        }
    }
`

const DELETE_INSTRUCTOR_GQL = gql`mutation di($id: Int!){
    deleteinstructor(id: $id){
        success
    }
}`

const UPDATE_INSTRUCTOR_INFO_GQL = gql`mutation updateinstructor($id: Int!, $name: String!, $phonenumber: String!, $memo: String, $address: String, $is_apprentice: Boolean, $level: String, $birthdate: String, $validation_date: String, $email: String, $job: String, $gender: String){
    update_instructor(id: $id, name: $name, phonenumber: $phonenumber, memo: $memo, address: $address, is_apprentice: $is_apprentice, level: $level, birthdate: $birthdate, validation_date: $validation_date, email: $email, job: $job, gender: $gender){
        success
        msg
    }
}`


const QUERY_SUBSCRIPTIONS_GQL = gql`query subscriptions{

    query_subscriptions{
        success
        subscriptions {
            id
            clientid
            clientname
            rounds
            totalcost
            created
            activity_type
            grouping_type
            coupon_backed
        }
    }

}`


const QUERY_SUBSCRIPTIONS_BY_CLIENTID = gql`
    query($clientid: Int!){
        query_subscriptions_by_clientid(clientid: $clientid){
            success
            subscriptions {
                id
                clientid
                clientname
                rounds
                totalcost
                created
                activity_type
                grouping_type
                coupon_backed
            }
        }
    }
`

const QUERY_SUBSCRIPTION_OF_CLIENTNAME = gql`
    query($clientname:String){
        query_subscriptions_of_clientname(clientname:$clientname){
            success
            subscriptions {
                id
                clientid
                clientname
                rounds
                totalcost
                created
                activity_type
                grouping_type
                coupon_backed
            }
        }
    }
`


const CREATE_SUBSCRIPTION_GQL = gql`mutation create_subscription($clientid: Int!, $rounds: Int!, $totalcost: Int!, $activity_type: String!, $grouping_type: String!, $coupon_backed: String){

    create_subscription(clientid: $clientid, rounds: $rounds, totalcost: $totalcost, activity_type: $activity_type, grouping_type: $grouping_type, coupon_backed: $coupon_backed){
        success
        
    }

}`


const DELETE_SUBSCRITION_GQL = gql`mutation delete_subscription($id:Int!){
    delete_subscription(id: $id){
        success
    }
}`

//query_subscriptions_with_remainrounds_for_clientid
const QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID = gql`query query_subscriptions_with_remainrounds_for_clientid($clientid: Int!, $activity_type: String!, $grouping_type: String!){
    query_subscriptions_with_remainrounds_for_clientid(clientid: $clientid, activity_type: $activity_type, grouping_type: $grouping_type){
        success
    subscriptions {
      subscription{
          id
          created
      }
      tickets {
        id
        expire_time
      }
    }
    }
}`

const ABLE_CLIENT_BY_CLIENTID = gql`
mutation($clientid: Int!){
    able_client_by_clientid(clientid: $clientid){
        success
        msg
    }
}
`

const DISABLE_CLIENT_BY_CLIENTID = gql`
mutation($clientid: Int!){
    disable_client_by_clientid(clientid: $clientid){
        success
        msg
    }
}
`

const QUERY_CLIENTS_BY_NAME = gql`
    query($name:String!){
        query_clients_by_name(name:$name){
                
            success
            clients{
                id
                name
                phonenumber
                created
                job
                gender
                email
                address
                memo
                birthdate
                disabled
            }
        }
    }
`

const SEARCH_CLIENT_WITH_NAME = gql`query search_clients($name: String!){
    search_client_with_name(name: $name){
        id
        name
        phonenumber
        disabled
    }
}`


const SEARCH_INSTRUCTOR_WITH_NAME = gql`query search_instructors($name: String!){
    search_instructor_with_name(name: $name){
        id
        name
        phonenumber
        disabled
    }
}`


const FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID = gql`query fetch_instructor_with_id($id: Int!){
    fetch_instructor_with_id(id: $id){
        success
        msg
        instructor {
            id
            name
            phonenumber
            created
            is_apprentice
            birthdate
            validation_date
            level
            job
            gender
            email
            address
            memo
            disabled
        }

    }
}`



const CREATE_CLIENT_GQL = gql`mutation  createclient($name: String!, $phonenumber: String!, $email: String, $job: String, $memo: String, $address: String, $gender: String, $birthdate: String){
    createclient(name: $name, phonenumber: $phonenumber, email: $email, job: $job, memo: $memo, address: $address, gender: $gender, birthdate: $birthdate){
        success
        msg
    }
}`



const FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID = gql`query a($clientid: Int!){
    query_all_subscriptions_with_remainrounds_for_clientid(clientid: $clientid){
        success
        msg
        allSubscriptionsWithRemainRounds{
            subscription_id
            total_rounds
            remain_rounds
            created
            activity_type
            grouping_type
        }
    }
}`


const CREATE_INSTRUCTOR_GQL = gql`mutation a($name: String!, $phonenumber: String!, $job: String, $address: String, $birthdate: String, $validation_date: String, $gender: String, $email: String, $memo: String, $level: String, $is_apprentice: Boolean){

    create_instructor(name: $name, phonenumber: $phonenumber, job: $job, gender: $gender, address: $address, birthdate: $birthdate, validation_date: $validation_date, email: $email, memo: $memo, level: $level, is_apprentice: $is_apprentice){
        success
        msg
    }
    

}`

const FETCH_TICKETS_FOR_SUBSCRIPTION_ID = gql`query b($subscription_id: Int!){
    fetch_tickets_for_subscription_id(subscription_id: $subscription_id){
        success
        msg
        tickets{
            id
            created_date
            expire_time
            destroyed_date
            consumed_date
        }
    }
}`


const TRANSFER_TICKETS_TO_CLIENTID = gql`
    mutation($ticket_id_list: [Int], $clientid: Int!){
        transfer_tickets_to_clientid(ticket_id_list: $ticket_id_list, clientid: $clientid){
            success
            msg
        }
        
    }
`
const UPDATE_EXPDATE_OF_TICKETS = gql`
    mutation($ticket_id_list : [Int], $new_expdate: String!){
        update_expdate_of_tickets(ticket_id_list: $ticket_id_list, new_expdate: $new_expdate){
            success
            msg
        }
}
`


const QUERY_CLIENTINFO_BY_CLIENTID = gql`
    query($clientid: Int!){
        query_clientinfo_by_clientid(clientid: $clientid){
            success
            msg
            client{
                id
                name
                phonenumber
                created
                job
                gender
                email
                address
                memo
                birthdate
                disabled
            }
        }
    }
`

export {
    ATTEMPT_UPDATE_SCHEDULE_TIME_GQL,
    QUERY_LESSON_WITH_DATERANGE_GQL,
    DELETE_LESSON_GQL,
    CREATE_LESSON_GQL,
    FETCH_LESSON_GQL,
    QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL,
    QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL,
    FETCH_CLIENTS_GQL,
    DELETE_CLIENT_GQL,
    UPDATE_CLIENT_INFO_GQL,
    LIST_INSTRUCTOR_GQL,
    DELETE_INSTRUCTOR_GQL,
    UPDATE_INSTRUCTOR_INFO_GQL,
    QUERY_SUBSCRIPTIONS_GQL,
    CREATE_SUBSCRIPTION_GQL,
    DELETE_SUBSCRITION_GQL,
    QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
    SEARCH_CLIENT_WITH_NAME,
    SEARCH_INSTRUCTOR_WITH_NAME,
    CREATE_INDIVIDUAL_LESSON_GQL,
    CREATE_CLIENT_GQL,
    FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
    CREATE_INSTRUCTOR_GQL,
    FETCH_TICKETS_FOR_SUBSCRIPTION_ID,
    FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID,
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
    QUERY_SUBSCRIPTION_OF_CLIENTNAME,
    QUERY_SUBSCRIPTIONS_BY_CLIENTID,
    QUERY_CLIENTS_BY_NAME,
    DISABLE_CLIENT_BY_CLIENTID,
    ABLE_CLIENT_BY_CLIENTID,
    DISABLE_INSTURCTOR_BY_ID,
    ABLE_INSTRUCTOR_BY_ID,
    TRANSFER_TICKETS_TO_CLIENTID,
    UPDATE_EXPDATE_OF_TICKETS,
    QUERY_CLIENTINFO_BY_CLIENTID
}