import { gql } from '@apollo/client'


export const FETCH_CLIENTS_BY_PHONENUMBER = gql`
    query($phonenumber: String!){
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
    query($clientid: Int!){
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
    mutation($clientid:Int!, $lessonid: Int!){
        checkin_lesson_for_client(clientid:$clientid, lessonid: $lessonid){
            success
            msg
        }
    }
`

//get_new_token
export const GET_NEW_TOKEN = gql`
    mutation($password: String!){
        get_new_token(password: $password){
            success
            msg
            token
        }
    }
`

//check_token
export const CHECK_TOKEN = gql`
    query{
        check_token{
            success
            msg
            is_valid
        }
    }
`

