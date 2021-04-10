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

// instructorid: Int!, starttime: String!, endtime: String!, ticketids: [Int!]
const CREATE_LESSON_GQL = gql`mutation createlesson($instructorid:Int!, $starttime: String!, $endtime:String!, $ticketids:[Int!]){
    
    create_lesson(ticketids: $ticketids, instructorid: $instructorid, starttime: $starttime, endtime: $endtime){
        success
        msg
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
        success
        msg
        lessons {
            id
            lesson_domain
            indomain_id
            client_info_arr {
                clientid
                clientname
                clientphonenumber
                ticketid
            }
            instructorid
            instructorname
            instructorphonenumber
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
        msg
        lessons {
            id
            client_info_arr {
                clientid
                clientname
                clientphonenumber
            }
            instructorid
            instructorname
            instructorphonenumber
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
        msg
        lessons {
            id
            client_info_arr {
                clientid
                clientname
                clientphonenumber
            }
            instructorid
            instructorname
            instructorphonenumber
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
            level_string
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

const UPDATE_INSTRUCTOR_INFO_GQL = gql`mutation updateinstructor($id: Int!, $name: String!, $phonenumber: String!, $memo: String, $address: String, $is_apprentice: Boolean, $level: Int, $birthdate: String, $validation_date: String, $email: String, $job: String, $gender: String){
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


const CREATE_SUBSCRIPTION_GQL = gql`mutation create_subscription($clientid: Int!, $rounds: Int!, $totalcost: Int!, $activity_type: String!, $grouping_type: String!, $coupon_backed: String, $expiredate: String!){

    create_subscription(clientid: $clientid, rounds: $rounds, totalcost: $totalcost, activity_type: $activity_type, grouping_type: $grouping_type, coupon_backed: $coupon_backed, expiredate: $expiredate){
        success
        msg
    }

}`


const DELETE_SUBSCRITION_GQL = gql`mutation delete_subscription($id:Int!){
    delete_subscription(id: $id){
        success
        msg
    }
}`


const QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID = gql`query query_subscriptions_with_remainrounds_for_clientid($clientid: Int!, $activity_type: String!, $grouping_type: String!){
    query_subscriptions_with_remainrounds_for_clientid(clientid: $clientid, activity_type: $activity_type, grouping_type: $grouping_type){
        success
        msg
        planandtickets{
            planid
            total_ticket_count
            avail_ticket_count
            avail_ticket_id_list
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
            level_string
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
            planid
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


const CANCEL_INDIVIDUAL_LESSON = gql`
    mutation ($clientid: Int!, $lessonid: Int!, $reqtype: String!, $force_penalty: Boolean!){
        cancel_individual_lesson(clientid:$clientid, lessonid: $lessonid, reqtype: $reqtype, force_penalty: $force_penalty){
            success
            warning
            msg
        }
    }
`


const CHANGE_CLIENTS_OF_LESSON = gql`
    mutation ($ticketid_arr: [Int], $lessonid: Int!){
        change_clients_of_lesson(ticketid_arr: $ticketid_arr, lessonid: $lessonid){
            success
            msg
        }
    }
`


const QUERY_LESSON_DATA_OF_INSTRUCTORID = gql`
    query ($instructorid: Int!, $search_starttime:String!, $search_endtime: String!){
        query_lesson_data_of_instructorid(instructorid:$instructorid, search_starttime: $search_starttime, search_endtime: $search_endtime){
            success
            msg
            lesson_info_arr{
                id
                starttime
                endtime
                activity_type
                grouping_type
                client_info_arr {
                    id 
                    name
                }
                netvalue
                canceled_time
                cancel_type
            }
        }
    }
`


const FETCH_INSTRUCTOR_LEVEL_INFO = gql`
    query{
        fetch_instructor_level_info{
            success
            msg
            info_list {
                id
                level_string
            }
        }
    }
`


const UPDATE_INSTRUCTOR_LEVEL = gql`
    mutation ($id:Int!, $level_string: String!){
        update_instructor_level(id:$id, level_string:$level_string){
            success
            msg
        }
    }
`

const ADD_INSTRUCTOR_LEVEL = gql`
    mutation ($level_string:String!){
        add_instructor_level(level_string: $level_string){
            success
            msg
            id
        }
    }
`

const DELETE_INSTRUCTOR_LEVEL = gql`
    mutation($id:Int!){
        delete_instructor_level(id:$id){
            success
            msg
        }
    }
`

const DELETE_TICKETS = gql`
    mutation($ticketid_arr: [Int]){
        delete_tickets(ticketid_arr: $ticketid_arr){
            success
            msg
        }
    }
`


const QUERY_SUBSCRIPTION_INFO_WITH_TICKET_INFO = gql`
    query($id:Int!){
        query_subscription_info_with_ticket_info(id:$id){
            success
            msg
            subscription_info{
                id
                clientid
                clientname
                rounds
                totalcost
                created
                activity_type
                grouping_type
                coupon_backed
                tickets {
                    id
                    created_date
                    expire_time
                    destroyed_date
                    consumed_date
                }
            }
        }
    }
`


const ADD_TICKETS = gql`
    mutation($planid:Int!, $addsize: Int!, $expire_datetime: String!){
        add_tickets(planid:$planid, addsize:$addsize, expire_datetime: $expire_datetime){
            success 
            msg
        }
    }
`

const CHANGE_PLAN_TOTALCOST = gql`
    mutation($planid: Int!, $totalcost: Int!){
        change_plan_totalcost(planid:$planid, totalcost:$totalcost){
            success 
            msg
        }
    }
`


const CREATE_APPRENTICE_COURSE = gql`
    mutation($name: String!){
        create_apprentice_course(name:$name){
            success
            msg
        }
    }
`


const FETCH_APPRENTICE_COURSES = gql`
    query{
        fetch_apprentice_courses{
            success
            msg
            courses {
                id 
                name
            }
        }
    }
`


const FETCH_APPRENTICE_INSTRUCTORS = gql`
    query{
        fetch_apprentice_instructors{
            success
            msg

            apprenticeInstructors{
                id 
                name 
                gender 
                course_name
                phonenumber
            }
        }
    }
`

const CREATE_APPRENTICE_INSTRUCTOR = gql`
    mutation($name:String!, $phonenumber: String!, $gender: String, $course_id: Int){
        create_apprentice_instructor(name:$name, phonenumber:$phonenumber, gender:$gender, course_id:$course_id){
            success 
            msg
        }
    }
`


const FETCH_APPRENTICE_INSTRUCTOR_PLANS = gql`
    query{
        fetch_apprentice_instructor_plans{
            success 
            msg
            plans {
                id
                apprentice_instructor_name
                apprentice_instructor_id
                activity_type
                grouping_type
                created
                rounds
                totalcost
            }
        }
    }
`


const QUERY_APPRENTICE_INSTRUCTOR_BY_NAME = gql`
    query($name:String!){
        query_apprentice_instructor_by_name(name:$name){
            success
            msg
            apprenticeInstructors{
                id
                name
                gender
                course_name
                course_id
                phonenumber
            }
        }
    }
`

const FETCH_APPRENTICE_INSTRUCTOR_BY_ID = gql`
    query($id:Int!){
        fetch_apprentice_instructor_by_id(id:$id){
            success
            msg
            apprenticeInstructors{
                id
                name
                gender
                course_name
                phonenumber
                course_id
            }
        }
    }
`

const CREATE_APPRENTICE_PLAN = gql`
    mutation($apprentice_instructor_id:Int!, $totalcost:Int!, $rounds:Int!, $activity_type:String!, $grouping_type:String!, $expiretime:String!){
        create_apprentice_plan(apprentice_instructor_id: $apprentice_instructor_id, totalcost: $totalcost, rounds: $rounds, activity_type: $activity_type, grouping_type: $grouping_type, expiretime:$expiretime){
            success
            msg
        }
    }
`


const UPDATE_APPRENTICE_INSTRUCTOR = gql`
    mutation($id:Int!,$name:String!, $phonenumber: String!, $gender: String, $course_id: Int){
        update_apprentice_instructor(id:$id,name:$name, phonenumber:$phonenumber, gender:$gender, course_id:$course_id){
            success
            msg
        }
    }
`


const FETCH_APPRENTICE_PLAN_BY_ID = gql`
    query($id:Int!){
        fetch_apprentice_plan_by_id(id:$id){
            success
            msg
            plans{
                id
                apprentice_instructor_name
                apprentice_instructor_id
                apprentice_instructor_phonenumber
                activity_type
                grouping_type
                created
                rounds
                totalcost
            }
        }
    }
`

const FETCH_APPRENTICE_TICKETS_OF_PLAN = gql`
    query($id:Int!){
        fetch_apprentice_tickets_of_plan(id:$id){
            success 
            msg
            tickets {
                id
                expire_time
                consumed_time
            }
        }
    }
`


const ADD_APPRENTICE_TICKET_TO_PLAN = gql`
    mutation($id:Int!, $amount:Int!){
        add_apprentice_tickets_to_plan(id:$id, amount:$amount){
            success 
            msg
        }
    }
`

const CHANGE_EXPIRE_TIME_OF_APPRENTICE_TICKETS = gql`
    mutation($id_arr:[Int!], $new_expire_time: String!){
        change_expire_time_of_apprentice_tickets(id_arr:$id_arr, new_expire_time: $new_expire_time){
            success 
            msg
        }
    }
`


// transfer_apprentice_tickets_to_apprentice
const TRANSFER_APPRENTICE_TICKETS_TO_APPRENTICE = gql`
    mutation($id_arr:[Int!], $apprentice_id:Int!){
        transfer_apprentice_tickets_to_apprentice(id_arr:$id_arr, apprentice_id:$apprentice_id){
            success 
            msg
        }
    }
`


// fetch_apprentice_plans_of_apprentice_instructor_and_agtype
const FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE = gql`
    query($apprentice_instructor_id:Int!, $activity_type:String!, $grouping_type: String!){
        fetch_apprentice_plans_of_apprentice_instructor_and_agtype(apprentice_instructor_id: $apprentice_instructor_id, activity_type:$activity_type, grouping_type:$grouping_type){
            success 
            msg 
            plans {
                id
                apprentice_instructor_name
                apprentice_instructor_id
                apprentice_instructor_phonenumber
                activity_type
                grouping_type
                created
                totalcost
                rounds
                remainrounds
            }
        }
    }
`

// create_apprentice_lesson
const CREATE_APPRENTICE_LESSON = gql`
    mutation($plan_id: Int!, $starttime: String, $hours:Int, $apprentice_instructor_id:Int!, $activity_type: String, $grouping_type: String!){
        create_apprentice_lesson(plan_id: $plan_id, starttime: $starttime, hours: $hours, apprentice_instructor_id: $apprentice_instructor_id , activity_type: $activity_type, grouping_type: $grouping_type){
            success 
            msg
        }
    }
`

// change_apprentice_lesson_starttime
export const CHANGE_APPRENTICE_LESSON_STARTTIME = gql`
    mutation($lessonid:Int!, $starttime: String){
        change_apprentice_lesson_starttime(lessonid:$lessonid, starttime:$starttime){
            success 
            msg
        }
    }
`

// cancel_apprentice_lesson
export const CANCEL_APPRENTICE_LESSON = gql`
    mutation($lessonid:Int!){
        cancel_apprentice_lesson(lessonid:$lessonid){
            success 
            msg
        }
    }
`


export const DELETE_APPRENTICE_TICKETS = gql`
    mutation($id_arr:[Int!]){
        delete_apprentice_tickets(id_arr:$id_arr){
            success 
            msg
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
    QUERY_CLIENTINFO_BY_CLIENTID,
    CANCEL_INDIVIDUAL_LESSON,
    CHANGE_CLIENTS_OF_LESSON,
    QUERY_LESSON_DATA_OF_INSTRUCTORID,
    FETCH_INSTRUCTOR_LEVEL_INFO,
    UPDATE_INSTRUCTOR_LEVEL,
    ADD_INSTRUCTOR_LEVEL,
    DELETE_INSTRUCTOR_LEVEL,
    DELETE_TICKETS,
    QUERY_SUBSCRIPTION_INFO_WITH_TICKET_INFO,
    ADD_TICKETS,
    CHANGE_PLAN_TOTALCOST,
    CREATE_APPRENTICE_COURSE,
    FETCH_APPRENTICE_COURSES,
    FETCH_APPRENTICE_INSTRUCTORS,
    CREATE_APPRENTICE_INSTRUCTOR,
    FETCH_APPRENTICE_INSTRUCTOR_PLANS,
    QUERY_APPRENTICE_INSTRUCTOR_BY_NAME,
    CREATE_APPRENTICE_PLAN,
    FETCH_APPRENTICE_INSTRUCTOR_BY_ID,
    UPDATE_APPRENTICE_INSTRUCTOR,
    FETCH_APPRENTICE_PLAN_BY_ID,
    FETCH_APPRENTICE_TICKETS_OF_PLAN,
    ADD_APPRENTICE_TICKET_TO_PLAN,
    CHANGE_EXPIRE_TIME_OF_APPRENTICE_TICKETS,
    TRANSFER_APPRENTICE_TICKETS_TO_APPRENTICE,
    FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE,
    CREATE_APPRENTICE_LESSON
}