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


const DELETE_LESSON_GQL = gql`mutation deletelesson($lessonid:Int!){
    delete_lesson(lessonid:$lessonid){
        success
    }
}`

const QUERY_LESSON_WITH_DATERANGE_GQL = gql`query($start_time: String!, $end_time: String!){
    query_lessons_with_daterange(start_time: $start_time, end_time: $end_time){
        id,
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
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
        id,
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
    }
}`

const QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL = gql`query($instructorid: Int!, $start_time: String!, $end_time: String!){
    query_lesson_with_timerange_by_instructorid(instructorid: $instructorid, start_time: $start_time, end_time: $end_time){
        success
        lessons{
            id,
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
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
    instructors{
        id
        name
        phonenumber
        created
    }
} `


const DELETE_INSTRUCTOR_GQL = gql`mutation di($id: Int!){
    deleteinstructor(id: $id){
        success
    }
}`

const UPDATE_INSTRUCTOR_INFO_GQL = gql`mutation updateinstructor($id: Int!, $name: String!, $phonenumber: String!){
    update_instructor(id: $id, name: $name, phonenumber: $phonenumber){
        success
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


const SEARCH_CLIENT_WITH_NAME = gql`query search_clients($name: String!){
    search_client_with_name(name: $name){
        id
        name
        phonenumber
    }
}`


const SEARCH_INSTRUCTOR_WITH_NAME = gql`query search_instructors($name: String!){
    search_instructor_with_name(name: $name){
        id
        name
        phonenumber
    }
}`

// const CREATE_LESSON_GQL = gql`mutation create_lesson($clientids:[Int!], $instructorid: Int!, $start_time: String!, $end_time: String!){

//     create_lesson(clientids: $clientids, instructorid: $instructorid, start_time: $start_time, end_time: $end_time){
//         success
//     }
// }`

const CREATE_CLIENT_GQL = gql`mutation  createclient($name: String!, $phonenumber: String!, $email: String, $job: String, $memo: String, $address: String, $gender: String, $birthdate: String){
    createclient(name: $name, phonenumber: $phonenumber, email: $email, job: $job, memo: $memo, address: $address, gender: $gender, birthdate: $birthdate){

        success
        msg
    }
}`




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
    CREATE_CLIENT_GQL
    
}