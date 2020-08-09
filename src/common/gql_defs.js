import {gql} from '@apollo/client'


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


export {
    ATTEMPT_UPDATE_SCHEDULE_TIME_GQL,
    QUERY_LESSON_WITH_DATERANGE_GQL,
    DELETE_LESSON_GQL,
    CREATE_LESSON_GQL,
    FETCH_LESSON_GQL,
    QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL
}