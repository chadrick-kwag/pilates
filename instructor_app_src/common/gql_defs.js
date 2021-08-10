import { gql } from '@apollo/client'


export const FETCH_CLIENTS_BY_PHONENUMBER = gql`
    query query_clients_by_phonenumber($phonenumber: String!){
        query_clients_by_phonenumber(phonenumber: $phonenumber){
            success
            msg
            clients {
                id
                name
            }
        }
    }
`

export const FETCH_CLIENTINFO_AND_CHECKIN_LESSONS = gql`
    query query_checkin_lessons_of_client($clientid: Int!){
        query_checkin_lessons_of_client(clientid:$clientid){
            success
            msg
            lessons {
                id
                starttime
                endtime
                instructorid
                instructorname
                grouping_type
                activity_type
            }
        }
    }
`


export const SUBMIT_LESSON_ATTENDANCE = gql`
    mutation checkin_lesson_for_client($clientid:Int!, $lessonid: Int!){
        checkin_lesson_for_client(clientid:$clientid, lessonid: $lessonid){
            success
            msg
        }
    }
`

//get_new_token
export const GET_NEW_TOKEN = gql`
    mutation get_new_token($password: String!){
        get_new_token(password: $password){
            success
            msg
            token
        }
    }
`

//check_token
export const CHECK_TOKEN = gql`
    query check_token{
        check_token{
            success
            msg
            is_valid
        }
    }
`


export const QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTOR_PERSONID = gql`
    query query_lesson_with_timerange_by_instructor_personid($personid: Int!, $start_time: String!, $end_time: String!){
        query_lesson_with_timerange_by_instructor_personid(personid: $personid, start_time: $start_time, end_time: $end_time){
            success
            msg
            lessons {
                lesson_domain
                indomain_id 
                client_info_arr {
                    clientid
                    clientname
                    clientphonenumber
                    checkin_time
                }
                instructorid 
                instructorname 
                instructorphonenumber 
                starttime 
                endtime 
                activity_type 
                grouping_type 
                memo 
                title 
            }
        }
    }
`
