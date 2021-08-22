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

export const CHECK_PERSON_AND_CAN_CREATE_INSTRUCTOR_APP_ACCOUNT = gql`
query check_person_and_can_create_instructor_app_account($name: String!, $phonenumber: String!){
    check_person_and_can_create_instructor_app_account(name: $name, phonenumber: $phonenumber){
        success 
        msg
    }
}
`

export const CHECK_INSTRUCTOR_APP_TOKEN = gql`
    query check_instructor_app_token($token:String!){
        check_instructor_app_token(token:$token){
            success 
            msg
        }
    }
`


export const TRY_INSTRUCTOR_APP_LOGIN = gql`
    query try_instructor_app_login($username: String!, $password: String!){
        try_instructor_app_login(username:$username, password:$password){
            success 
            msg 
            token 
            username
        }
    }
`

export const CREATE_INSTRUCTOR_APP_ACCOUNT = gql`
    mutation create_instructor_app_account($username: String!, $password: String!, $name: String!, $phonenumber: String! ){
        create_instructor_app_account(username: $username, password: $password, name: $name, phonenumber: $phonenumber){
            success 
            msg
        }
    }
`

export const FETCH_INSTRUCTOR_APP_PROFILE = gql`
    query fetch_instructor_app_profile{
fetch_instructor_app_profile{
    
        success 
        msg
        profile {
            name 
            phonenumber
        }
}

    }
`

export const FETCH_AVAILABLE_CREATE_LESSON_TYPES = gql`
query fetch_available_create_lesson_types{
    fetch_available_create_lesson_types{
        success 
        msg 
        lesson_types
    }
}
`

export const CREATE_LESSON_FROM_INSTRUCTOR_APP = gql`
mutation create_lesson_from_instructor_app($lesson_type: String!, $activity_type: String!, $grouping_type: String!, $start_time: String!, $duration: Int!){
    create_lesson_from_instructor_app(lesson_type: $lesson_type, activity_type: $activity_type, grouping_type: $grouping_type, start_time: $start_time, duration: $duration){
        success 
        msg
    }
}
`

export const QUERY_LESSON_DETAIL_WITH_LESSONID = gql`
query query_lesson_detail_with_lessonid($lessonid: Int!){
    query_lesson_detail_with_lessonid(lessonid: $lessonid){
        success 
        msg
        detail {
            id 
            client_info_arr {
                clientid 
                clientname 
                clientphonenumber 
                checkin_time 
                clientpersonid 
            }
            instructorid 
            instructorname 
            starttime 
            endtime 
            activity_type 
            grouping_type
        }
    }
}
`

export const CREATE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP = gql`
mutation create_apprentice_lesson_from_instructor_app($activity_type: String!, $grouping_type: String!, $start_time: String!, $duration: Int!, $ticket_ids: [Int!]){
    create_apprentice_lesson_from_instructor_app(activity_type: $activity_type, grouping_type: $grouping_type, start_time: $start_time, duration: $duration, ticket_ids: $ticket_ids){
        success 
        msg
    }
}
`

export const FETCH_AVAILABLE_APPRENTICE_PLANS = gql`
query fetch_available_apprentice_plans($activity_type: String!, $grouping_type: String!){
    fetch_available_apprentice_plans(activity_type: $activity_type, grouping_type: $grouping_type){
        success 
        msg 
        plans {
            id
            created
            tickets {
                id 
                expire_time 
                consumed_time
            }
        }
    }
}
`

export const CREATE_NORMAL_LESSON_FROM_INSTRUCTOR_APP = gql`
mutation create_normal_lesson_from_instructor_app($activity_type: String!, $grouping_type: String!, $start_time: String!, $duration: Int!){
    create_normal_lesson_from_instructor_app(activity_type: $activity_type, grouping_type: $grouping_type, start_time: $start_time, duration: $duration){
        success 
        msg
    }
}
`

export const FETCH_APPRENTICE_LESSON_INFO = gql`
query fetch_apprentice_lesson_info($lessonid : Int!){
    fetch_apprentice_lesson_info(lessonid: $lessonid){
        success 
        msg
        lesson {
            id 
            starttime 
            endtime 
            apprentice_instructor_id 
            apprentice_instructor_name 
            apprentice_instructor_phonenumber 
            activity_type 
            grouping_type 
            

        }

    }
}
`

export const UPDATE_NORMAL_LESSON_FROM_INSTRUCTOR_APP = gql`
    mutation update_normal_lesson_from_instructor_app($lessonid: Int!, $activity_type: String!, $grouping_type: String!, $start_time: String!, $duration: Int!){
        update_normal_lesson_from_instructor_app(lessonid: $lessonid, activity_type: $activity_type, grouping_type: $grouping_type, start_time: $start_time, duration: $duration){
            success 
            msg
        }
    }
`

export const UPDATE_APPRENTICE_LESSON_START_TIME_FROM_INSTRUCTOR_APP = gql`
    mutation update_apprentice_lesson_start_time_from_instructor_app($lessonid: Int!, $start_time: String!){
        update_apprentice_lesson_start_time_from_instructor_app(lessonid: $lessonid, start_time: $start_time){
            success 
            msg
        }
    }
`

export const DELETE_NORMAL_LESSON_FROM_INSTRUCTOR_APP = gql`
mutation delete_normal_lesson_from_instructor_app($lessonid: Int!){
    delete_normal_lesson_from_instructor_app(lessonid: $lessonid){
        success 
        msg
    }
}
`

export const DELETE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP = gql`
mutation delete_apprentice_lesson_from_instructor_app($lessonid: Int!){
    delete_apprentice_lesson_from_instructor_app(lessonid: $lessonid){
        success 
        msg
    }
}
`

export const CHANGE_PASSWORD_OF_INSTRUCTOR_APP_ACCOUNT = gql`
mutation change_password_of_instructor_app_account($current_pw: String!, $new_password: String!){
    change_password_of_instructor_app_account(current_pw: $current_pw, new_password: $new_password){
        success 
        msg
    }
}
`

export const CHECK_PERSON_CAN_CREATE_INSTRUCTOR_ACCOUNT = gql`
query check_person_can_create_instructor_account($name: String!, $phonenumber: String!){
    check_person_can_create_instructor_account(name: $name, phonenumber: $phonenumber){
        success 
        msg
    }
}
`