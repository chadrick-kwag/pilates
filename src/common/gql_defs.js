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

const LIST_CLIENT_GQL = gql`{
    clients{
        id
        name
        phonenumber
        created
    }
}`

const DELETE_CLIENT_GQL = gql`mutation DeleteClient($id:Int!){
    deleteclient(id: $id){
        success
    }
}`


const UPDATE_CLIENT_INFO_GQL = gql`mutation updateclient($id: Int!, $name: String!, $phonenumber: String!){
    update_client(id: $id, name: $name, phonenumber: $phonenumber){
        success
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
        }
    }

}`


const CREATE_SUBSCRIPTION_GQL = gql`mutation create_subscription($clientid: Int!, $rounds: Int!, $totalcost: Int!){

    create_subscription(clientid: $clientid, rounds: $rounds, totalcost: $totalcost){
        success
        
    }

}`


const DELETE_SUBSCRITION_GQL = gql`mutation delete_subscription($id:Int!){
    delete_subscription(id: $id){
        success
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
    LIST_CLIENT_GQL,
    DELETE_CLIENT_GQL,
    UPDATE_CLIENT_INFO_GQL,
    LIST_INSTRUCTOR_GQL,
    DELETE_INSTRUCTOR_GQL,
    UPDATE_INSTRUCTOR_INFO_GQL,
    QUERY_SUBSCRIPTIONS_GQL,
    CREATE_SUBSCRIPTION_GQL,
    DELETE_SUBSCRITION_GQL
}