import { gql } from '@apollo/client'



// instructorid: Int!, starttime: String!, endtime: String!, ticketids: [Int!]
export const CREATE_LESSON_GQL = gql`mutation createlesson($instructorid:Int!, $starttime: String!, $endtime:String!, $ticketids:[Int!], $activity_type:String!, $grouping_type: String!){
    
    create_lesson(ticketids: $ticketids, instructorid: $instructorid, starttime: $starttime, endtime: $endtime, activity_type: $activity_type, grouping_type: $grouping_type){
        success
        msg
    }
}`

export const CREATE_INDIVIDUAL_LESSON_GQL = gql`mutation create_individual_lesson($clientid: Int!, $instructorid: Int!, $starttime: String!, $endtime: String!, $ticketid: Int!){
    create_individual_lesson(clientid: $clientid, instructorid: $instructorid, ticketid: $ticketid, starttime: $starttime, endtime: $endtime ){
        success
        msg
    }

}`




export const DELETE_LESSON_GQL = gql`mutation deletelesson($lessonid:Int!){
    delete_lesson(lessonid:$lessonid){
        success
        msg
    }
}`


export const DELETE_LESSON_WITH_REQUEST_TYPE_GQL = gql`mutation delete_lesson_with_request_type($lessonid: Int!, $request_type: String!, $ignore_warning: Boolean!){
    delete_lesson_with_request_type(lessonid: $lessonid, request_type: $request_type, ignore_warning: $ignore_warning){
        success
        penalty_warning
        msg
    }
}
`


export const QUERY_LESSON_WITH_DATERANGE_GQL = gql`query query_lessons_with_daterange($start_time: String!, $end_time: String!){
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
                ticketid_arr
                checkin_time
            }
            instructorid
            instructorname
            instructorphonenumber
            starttime
            endtime
            activity_type
            grouping_type
            title
            memo

        }
        
    }
}`




export const QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL = gql`query query_lesson_with_timerange_by_clientid($clientid: Int!, $start_time: String!, $end_time: String!){
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

export const QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL = gql`query query_lesson_with_timerange_by_instructorid($instructorid: Int!, $start_time: String!, $end_time: String!){
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

export const FETCH_CLIENTS_GQL = gql`query fetch_clients{
    
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

export const DELETE_CLIENT_GQL = gql`mutation DeleteClient($id:Int!){
    deleteclient(id: $id){
        success
        msg
    }
}`


export const UPDATE_CLIENT_INFO_GQL = gql`mutation updateclient($id: Int!, $name: String!, $phonenumber: String!, $gender:String, $address: String, $email: String, $memo: String, $birthdate: String, $job: String){
    update_client(id: $id, name: $name, phonenumber: $phonenumber, gender: $gender, email: $email, job: $job, memo: $memo, address: $address, birthdate: $birthdate){
        success
        msg
    }
}`


export const LIST_INSTRUCTOR_GQL = gql`query fetch_instructors{
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
            allow_teach_apprentice
        }
        

    }
} `


export const DISABLE_INSTURCTOR_BY_ID = gql`
    mutation disable_instructor_by_id($id:Int!){
        disable_instructor_by_id(id: $id){
            success
            msg
        }
    }
`

export const ABLE_INSTRUCTOR_BY_ID = gql`
    mutation able_instructor_by_id($id: Int!){
        able_instructor_by_id(id:$id){
            success
            msg
        }
    }
`

export const DELETE_INSTRUCTOR_GQL = gql`mutation deleteinstructor($id: Int!){
    deleteinstructor(id: $id){
        success
    }
}`

export const UPDATE_INSTRUCTOR_INFO_GQL = gql`mutation updateinstructor($id: Int!, $name: String!, $phonenumber: String!, $memo: String, $address: String, $is_apprentice: Boolean, $level: Int, $birthdate: String, $validation_date: String, $email: String, $job: String, $gender: String, $allow_teach_apprentice: Boolean!){
    update_instructor(id: $id, name: $name, phonenumber: $phonenumber, memo: $memo, address: $address, is_apprentice: $is_apprentice, level: $level, birthdate: $birthdate, validation_date: $validation_date, email: $email, job: $job, gender: $gender, allow_teach_apprentice: $allow_teach_apprentice){
        success
        msg
    }
}`


export const QUERY_SUBSCRIPTIONS_GQL = gql`query query_subscriptions{

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


export const QUERY_SUBSCRIPTIONS_BY_CLIENTID = gql`
    query query_subscriptions_by_clientid($clientid: Int!){
        query_subscriptions_by_clientid(clientid: $clientid){
            success
            subscriptions {
                id
                clientid
                clientname
                rounds
                totalcost
                created
                types {
                    activity_type
                    grouping_type
                }
                coupon_backed
            }
        }
    }
`

export const QUERY_SUBSCRIPTION_OF_CLIENTNAME = gql`
    query query_subscriptions_of_clientname($clientname:String){
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


export const CREATE_SUBSCRIPTION_GQL = gql`mutation create_subscription($clientid: Int!, $rounds: Int!, $totalcost: Int!, $activity_type_arr: [String!], $grouping_type: String!, $coupon_backed: String, $expiredate: String!){

    create_subscription(clientid: $clientid, rounds: $rounds, totalcost: $totalcost, activity_type_arr: $activity_type_arr, grouping_type: $grouping_type, coupon_backed: $coupon_backed, expiredate: $expiredate){
        success
        msg
    }

}`


export const DELETE_SUBSCRITION_GQL = gql`mutation delete_subscription($id:Int!){
    delete_subscription(id: $id){
        success
        msg
    }
}`


export const QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID = gql`query query_subscriptions_with_remainrounds_for_clientid($clientid: Int!, $activity_type: String!, $grouping_type: String!){
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

export const ABLE_CLIENT_BY_CLIENTID = gql`
mutation able_client_by_clientid($clientid: Int!){
    able_client_by_clientid(clientid: $clientid){
        success
        msg
    }
}
`

export const DISABLE_CLIENT_BY_CLIENTID = gql`
mutation disable_client_by_clientid($clientid: Int!){
    disable_client_by_clientid(clientid: $clientid){
        success
        msg
    }
}
`

export const QUERY_CLIENTS_BY_NAME = gql`
    query query_clients_by_name($name:String!){
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




export const SEARCH_INSTRUCTOR_WITH_NAME = gql`query search_instructor_with_name($name: String!){
    search_instructor_with_name(name: $name){
        id
        name
        phonenumber
        disabled
    }
}`


export const FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID = gql`query fetch_instructor_with_id($id: Int!){
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
            allow_teach_apprentice
        }

    }
}`



export const CREATE_CLIENT_GQL = gql`mutation  createclient($name: String!, $phonenumber: String!, $email: String, $job: String, $memo: String, $address: String, $gender: String, $birthdate: String){
    createclient(name: $name, phonenumber: $phonenumber, email: $email, job: $job, memo: $memo, address: $address, gender: $gender, birthdate: $birthdate){
        success
        msg
    }
}`



export const FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID = gql`query query_all_subscriptions_with_remainrounds_for_clientid($clientid: Int!){
    query_all_subscriptions_with_remainrounds_for_clientid(clientid: $clientid){
        success
        msg
        allSubscriptionsWithRemainRounds{
            planid
            total_rounds
            remain_rounds
            created
            plan_types{
                activity_type
                grouping_type
            }
        }
    }
}`


export const CREATE_INSTRUCTOR_GQL = gql`mutation create_instructor($name: String!, $phonenumber: String!, $job: String, $address: String, $birthdate: String, $validation_date: String, $gender: String, $email: String, $memo: String, $level: Int, $is_apprentice: Boolean){

    create_instructor(name: $name, phonenumber: $phonenumber, job: $job, gender: $gender, address: $address, birthdate: $birthdate, validation_date: $validation_date, email: $email, memo: $memo, level: $level, is_apprentice: $is_apprentice){
        success
        msg
    }
    

}`

export const FETCH_TICKETS_FOR_SUBSCRIPTION_ID = gql`query fetch_tickets_for_subscription_id($subscription_id: Int!){
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


export const TRANSFER_TICKETS_TO_CLIENTID = gql`
    mutation transfer_tickets_to_clientid($ticket_id_list: [Int], $clientid: Int!){
        transfer_tickets_to_clientid(ticket_id_list: $ticket_id_list, clientid: $clientid){
            success
            msg
        }
        
    }
`
export const UPDATE_EXPDATE_OF_TICKETS = gql`
    mutation update_expdate_of_tickets($ticket_id_list : [Int], $new_expdate: String!){
        update_expdate_of_tickets(ticket_id_list: $ticket_id_list, new_expdate: $new_expdate){
            success
            msg
        }
}
`


export const QUERY_CLIENTINFO_BY_CLIENTID = gql`
    query query_clientinfo_by_clientid($clientid: Int!){
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


export const CANCEL_INDIVIDUAL_LESSON = gql`
    mutation cancel_individual_lesson($clientid: Int!, $lessonid: Int!, $reqtype: String!, $force_penalty: Boolean!){
        cancel_individual_lesson(clientid:$clientid, lessonid: $lessonid, reqtype: $reqtype, force_penalty: $force_penalty){
            success
            warning
            msg
        }
    }
`




export const QUERY_LESSON_DATA_OF_INSTRUCTORID = gql`
    query query_lesson_data_of_instructorid($instructorid: Int!, $search_starttime:String!, $search_endtime: String!){
        query_lesson_data_of_instructorid(instructorid:$instructorid, search_starttime: $search_starttime, search_endtime: $search_endtime){
            success
            errcode
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
                    phonenumber
                }
                totalcost
                canceled_time
                cancel_type
            }
        }
    }
`


export const FETCH_INSTRUCTOR_LEVEL_INFO = gql`
    query fetch_instructor_level_info{
        fetch_instructor_level_info{
            success
            msg
            info_list {
                id
                rank
                level_string
                active 
                non_group_lesson_pay_percentage
                group_lesson_perhour_payment
                group_lesson_perhour_penalized_payment
            }
        }
    }
`

export const UPDATE_INSTRUCTOR_LEVEL = gql`
    mutation update_instructor_level($id:Int!, $rank:Int!,$level_string: String!, $active: Boolean!, $non_group_lesson_pay_percentage: Float!, $group_lesson_perhour_payment: Int!, $group_lesson_perhour_penalized_payment: Int!){
        update_instructor_level(id:$id, level_string:$level_string, active: $active, non_group_lesson_pay_percentage:$non_group_lesson_pay_percentage, 
            group_lesson_perhour_payment: $group_lesson_perhour_payment,
        group_lesson_perhour_penalized_payment: $group_lesson_perhour_penalized_payment , rank:$rank ){
            success
            msg
        }
    }
`

export const ADD_INSTRUCTOR_LEVEL = gql`
    mutation  add_instructor_level($level_string:String!, $active: Boolean!, $non_group_lesson_pay_percentage: Float!, $group_lesson_perhour_payment: Int!, $group_lesson_perhour_penalized_payment: Int!, $rank: Int!){
        add_instructor_level(level_string: $level_string, active: $active, non_group_lesson_pay_percentage:$non_group_lesson_pay_percentage, 
            group_lesson_perhour_payment: $group_lesson_perhour_payment,
        group_lesson_perhour_penalized_payment: $group_lesson_perhour_penalized_payment, rank:$rank){
            success
            msg
            id
        }
    }
`

export const DELETE_INSTRUCTOR_LEVEL = gql`
    mutation delete_instructor_level($id:Int!){
        delete_instructor_level(id:$id){
            success
            msg
        }
    }
`

export const DELETE_TICKETS = gql`
    mutation delete_tickets($ticketid_arr: [Int]){
        delete_tickets(ticketid_arr: $ticketid_arr){
            success
            msg
        }
    }
`


export const QUERY_SUBSCRIPTION_INFO_WITH_TICKET_INFO = gql`
    query query_subscription_info_with_ticket_info($id:Int!){
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


export const ADD_TICKETS = gql`
    mutation add_tickets($planid:Int!, $addsize: Int!, $expire_datetime: String!, $per_ticket_cost: Int!){
        add_tickets(planid:$planid, addsize:$addsize, expire_datetime: $expire_datetime, per_ticket_cost: $per_ticket_cost){
            success 
            msg
        }
    }
`

export const CHANGE_PLAN_TOTALCOST = gql`
    mutation change_plan_totalcost($planid: Int!, $totalcost: Int!){
        change_plan_totalcost(planid:$planid, totalcost:$totalcost){
            success 
            msg
        }
    }
`


export const CREATE_APPRENTICE_COURSE = gql`
    mutation create_apprentice_course($name: String!){
        create_apprentice_course(name:$name){
            success
            msg
        }
    }
`


export const FETCH_APPRENTICE_COURSES = gql`
    query fetch_apprentice_courses{
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


export const FETCH_APPRENTICE_INSTRUCTORS = gql`
    query fetch_apprentice_instructors{
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

export const CREATE_APPRENTICE_INSTRUCTOR = gql`
    mutation create_apprentice_instructor($name:String!, $phonenumber: String!, $gender: String, $course_id: Int){
        create_apprentice_instructor(name:$name, phonenumber:$phonenumber, gender:$gender, course_id:$course_id){
            success 
            msg
        }
    }
`




export const QUERY_APPRENTICE_INSTRUCTOR_BY_NAME = gql`
    query query_apprentice_instructor_by_name($name:String!){
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

export const FETCH_APPRENTICE_INSTRUCTOR_BY_ID = gql`
    query fetch_apprentice_instructor_by_id($id:Int!){
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

export const CREATE_APPRENTICE_PLAN = gql`
    mutation create_apprentice_plan($apprentice_instructor_id:Int!, $totalcost:Int!, $rounds:Int!, $activity_type:String!, $grouping_type:String!, $expiretime:String!){
        create_apprentice_plan(apprentice_instructor_id: $apprentice_instructor_id, totalcost: $totalcost, rounds: $rounds, activity_type: $activity_type, grouping_type: $grouping_type, expiretime:$expiretime){
            success
            msg
        }
    }
`


export const UPDATE_APPRENTICE_INSTRUCTOR = gql`
    mutation update_apprentice_instructor($id:Int!,$name:String!, $phonenumber: String!, $gender: String, $course_id: Int){
        update_apprentice_instructor(id:$id,name:$name, phonenumber:$phonenumber, gender:$gender, course_id:$course_id){
            success
            msg
        }
    }
`

export const FETCH_APPRENTICE_TICKETS_OF_PLAN = gql`
    query fetch_apprentice_tickets_of_plan($id:Int!){
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


export const ADD_APPRENTICE_TICKET_TO_PLAN = gql`
    mutation add_apprentice_tickets_to_plan($id:Int!, $addsize:Int!, $expire_datetime:String!, $percost: Int!){
        add_apprentice_tickets_to_plan(id:$id, addsize:$addsize, expire_datetime: $expire_datetime, percost: $percost){
            success 
            msg
        }
    }
`

export const CHANGE_EXPIRE_TIME_OF_APPRENTICE_TICKETS = gql`
    mutation change_expire_time_of_apprentice_tickets($id_arr:[Int!], $new_expire_time: String!){
        change_expire_time_of_apprentice_tickets(id_arr:$id_arr, new_expire_time: $new_expire_time){
            success 
            msg
        }
    }
`


// transfer_apprentice_tickets_to_apprentice
export const TRANSFER_APPRENTICE_TICKETS_TO_APPRENTICE = gql`
    mutation transfer_apprentice_tickets_to_apprentice($id_arr:[Int!], $apprentice_id:Int!){
        transfer_apprentice_tickets_to_apprentice(id_arr:$id_arr, apprentice_id:$apprentice_id){
            success 
            msg
        }
    }
`


// fetch_apprentice_plans_of_apprentice_instructor_and_agtype
export const FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE = gql`
    query fetch_apprentice_plans_of_apprentice_instructor_and_agtype($apprentice_instructor_id:Int!, $activity_type:String!, $grouping_type: String!){
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

//fetch_apprentice_plans_of_apprentice_instructor
export const FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR = gql`
    query fetch_apprentice_plans_of_apprentice_instructor($appinst_id: Int!){
        fetch_apprentice_plans_of_apprentice_instructor(appinst_id:$appinst_id){
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
export const CREATE_APPRENTICE_LESSON = gql`
    mutation create_apprentice_lesson($plan_id: Int!, $starttime: String, $hours:Int, $apprentice_instructor_id:Int!, $activity_type: String, $grouping_type: String!){
        create_apprentice_lesson(plan_id: $plan_id, starttime: $starttime, hours: $hours, apprentice_instructor_id: $apprentice_instructor_id , activity_type: $activity_type, grouping_type: $grouping_type){
            success 
            msg
        }
    }
`

// change_apprentice_lesson_starttime
export const CHANGE_APPRENTICE_LESSON_STARTTIME = gql`
    mutation change_apprentice_lesson_starttime($lessonid:Int!, $starttime: String){
        change_apprentice_lesson_starttime(lessonid:$lessonid, starttime:$starttime){
            success 
            msg
        }
    }
`

// cancel_apprentice_lesson
export const CANCEL_APPRENTICE_LESSON = gql`
    mutation cancel_apprentice_lesson($lessonid:Int!){
        cancel_apprentice_lesson(lessonid:$lessonid){
            success 
            msg
        }
    }
`


export const DELETE_APPRENTICE_TICKETS = gql`
    mutation delete_apprentice_tickets($id_arr:[Int!]){
        delete_apprentice_tickets(id_arr:$id_arr){
            success 
            msg
        }
    }
`


// fetch_client_stat
export const FETCH_CLIENT_STAT = gql`
    query fetch_client_stat{
        fetch_client_stat{
            success 
            msg
            stat {
                total_count
            }
        }
    }
`

//fetch_instructor_stat
export const FETCH_INSTRUCTOR_STAT = gql`
    query fetch_instructor_stat{
        fetch_instructor_stat{
            success
            msg
            stat{
                total_count
            }
        }
    }
`

//query_lesson_detail_with_lessonid
export const QUERY_LESSON_DETAIL_WITH_LESSONID = gql`
    query query_lesson_detail_with_lessonid($lessonid:Int!){
        query_lesson_detail_with_lessonid(lessonid:$lessonid){
            success
            msg
            detail {
                id
                instructorid
                instructorname
                instructorphonenumber
                starttime
                endtime
                activity_type
                grouping_type
                memo
                title
                client_info_arr{
                    clientid
                    clientname
                    clientphonenumber
                    ticketid_arr,
                    checkin_time
                }
            }
        }
    }
`

// fetch_ticket_available_plan_for_clientid_and_lessontypes
export const FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES = gql`
    query fetch_ticket_available_plan_for_clientid_and_lessontypes($clientid: Int!, $activity_type: String!, $grouping_type:String!, $excluded_ticket_id_arr: [Int]){
        fetch_ticket_available_plan_for_clientid_and_lessontypes(clientid:$clientid, activity_type: $activity_type, grouping_type: $grouping_type, excluded_ticket_id_arr: $excluded_ticket_id_arr ){
            success
            msg
            plans{
                planid
                plan_total_rounds
                tickets {
                    id
                    expire_time
                }
            }
        }
    }
`

// change_lesson_overall
export const CHANGE_NORMAL_LESSON_OVERALL = gql`

    

    mutation change_lesson_overall($client_tickets: [clientTickets!], $lessonid: Int!, $instructorid: Int!, $starttime:String!, $endtime: String!){
        change_lesson_overall(lessonid:$lessonid, client_tickets: $client_tickets, starttime: $starttime, endtime:$endtime, instructorid: $instructorid){
            success
            msg

        }
    }
`


export const FETCH_NORMAL_PLAN_DETAIL_INFO = gql`
    query fetch_normal_plan_detail_info($planid:Int!){
        fetch_normal_plan_detail_info(planid:$planid){
            success
            msg
            planinfo {
                id 
                clientid
                clientname
                clientphonenumber
                created
                totalcost
                types{
                    activity_type
                    grouping_type
                }
                tickets{
                    id
                    expire_time
                    consumed_time
                }
            }
           
        }
    }
`


// update_normal_plan_basicinfo
export const UPDATE_NORMAL_PLAN_BASICINFO = gql`
    mutation update_normal_plan_basicinfo($planid: Int!, $types: [IncomingPlanType], $totalcost: Int!, $clientid: Int!){
        update_normal_plan_basicinfo(planid:$planid, types:$types, totalcost: $totalcost, clientid: $clientid){
            success
            msg
        }
    }
`

//create_special_schedule 
export const CREATE_SPECIAL_SCHEDULE = gql`
    mutation create_special_schedule($starttime: String!, $endtime: String!, $title: String!, $memo: String){
        create_special_schedule(starttime: $starttime, endtime: $endtime, title: $title, memo: $memo){
            success
            msg
        }
    }
`

// fetch_special_schedule_by_id
export const FETCH_SPECIAL_SCHEDULE_BY_ID = gql`
    query fetch_special_schedule_by_id($id:Int!){
        fetch_special_schedule_by_id(id:$id){
            success
            schedule {
                id
                starttime
                endtime
                title 
                memo
            }
        }
    }
`

// change_special_schedule
export const CHANGE_SPECIAL_SCHEDULE_BY_ID = gql`
    mutation change_special_schedule($id: Int!, $starttime: String!, $endtime: String!, $title: String!, $memo: String){
        change_special_schedule(id:$id, starttime: $starttime, endtime: $endtime, title: $title, memo: $memo){
            success 
            msg
        }
    }
`

//delete_special_schedule 
export const DELETE_SPECIAL_SCHEDULE_BY_ID = gql`
    mutation delete_special_schedule($id: Int!){
        delete_special_schedule(id:$id){
            success 
            msg
        }
    }
`

export const TRY_LOGIN = gql`
    query try_login($username: String!, $password: String!){
        try_login(username:$username, password:$password){
            success
            msg
            token
            username
        }
    }
`


export const CREATE_ACCOUNT = gql`
    mutation create_account($username: String!, $password: String!){
        create_account(username:$username, password: $password){
            success
            msg
        }
    }
`


export const CHECK_ADMIN_AUTHTOKEN_VALID = gql`
    query check_admin_authtoken($token:String!){
        check_admin_authtoken(token:$token){

            success
            msg
        }
    }
`

//request_admin_account_creation
export const REQUEST_ADMIN_ACCOUNT_CREATION = gql`
    mutation request_admin_account_creation($username: String!, $password: String!, $contact: String){
        request_admin_account_creation(username:$username, password:$password, contact: $contact){
            success
            msg
        }
    }
`

// fetch_admin_account_create_requests
export const FETCH_ADMIN_ACCOUNT_CREATE_REQUESTS = gql`
    query fetch_admin_account_create_requests{
        fetch_admin_account_create_requests{
            success
            msg
            requests {
                id
                username
                request_time
            }
        }
    }
`


// approve_admin_account_request
export const APPROVE_ADMIN_ACCOUNT_REQUEST = gql`
    mutation approve_admin_account_request($id: Int!){
        approve_admin_account_request(id:$id){
            success
            msg
        }
    }
`

//check_token_is_core_admin

export const CHECK_TOKEN_IS_CORE_ADMIN = gql`
    query check_token_is_core_admin($token:String!){
        check_token_is_core_admin(token:$token){
            success
            msg
            is_core
        }
    }
`


//fetch_admin_accounts
export const FETCH_ADMIN_ACCOUNTS = gql`
    query fetch_admin_accounts{
        fetch_admin_accounts{
            success
            msg 
            accounts {
                id
                username
                created
                is_core_admin
            }
        }
    }
`


//change_admin_account_password
export const CHANGE_ADMIN_ACCOUNT_PASSWORD = gql`
    mutation change_admin_account_password($id:Int!, $password: String!){
        change_admin_account_password(id:$id, password: $password){
            success
            msg
        }
    }
`

// delete_admin_account
export const DELETE_ADMIN_ACCOUNT = gql`
    mutation delete_admin_account($id: Int!){
        delete_admin_account(id:$id){
            success
            msg
        }
    }
`

// update_core_status_of_admin_account
export const UPDATE_CORE_STATUS_OF_ADMIN_ACCOUNT = gql`
    mutation update_core_status_of_admin_account($id: Int!, $status: Boolean!){
        update_core_status_of_admin_account(id:$id, status:$status){
            success
            msg
        }
    }
`

//fetch_admin_account_profile
export const FETCH_ADMIN_ACCOUNT_PROFILE = gql`
    query fetch_admin_account_profile{
        fetch_admin_account_profile{
            success
            msg
            profile{
                id
                username
                created
                contact
            }
        }
    }
`
//change_my_admin_account_password
export const CHANGE_MY_ADMIN_ACCOUNT_PASSWORD = gql`
    mutation change_my_admin_account_password($existpassword:String!, $newpassword:String!){
        change_my_admin_account_password(existpassword:$existpassword, newpassword:$newpassword){
            success
            msg
        }
    }
`

//decline_admin_account_request
export const DECLINE_ADMIN_ACCOUNT_REQUEST = gql`
    mutation decline_admin_account_request($id:Int!){
        decline_admin_account_request(id:$id){
            success
            msg
        }
    }
`


// fetch_checkin_configs
export const FETCH_CHECKIN_CONFIGS = gql`
    query fetch_checkin_configs{
        fetch_checkin_configs{
            success
            msg
            config {
                scan_prev_hours
                scan_next_hours
                password
            }
        }
    }
`


// update_checkin_configs
export const UPDATE_CHECKIN_CONFIGS = gql`
    mutation update_checkin_configs($newconfig:String!){
        update_checkin_configs(newconfig:$newconfig){
            success
            msg
        }
    }
`


//update_totalcost_of_plan

export const UPDATE_TOTALCOST_OF_PLAN = gql`
    mutation update_totalcost_of_plan($id: Int!, $totalcost: Int!){
        update_totalcost_of_plan(id: $id, totalcost: $totalcost){
            success
            msg
        }
    }
`

// fetch_master_instructors
export const FETCH_MASTER_INSTRUCTORS = gql`
    query fetch_master_instructors{
        fetch_master_instructors{
            success
            msg
            instructors {
                id
                name 
                phonenumber
                email
                gender
                created
            }
        }
    }
`

// fetch_persons_by_name_and_phonenumber
export const FETCH_PERSONS_BY_NAME_AND_PHONENUMBER = gql`
    query fetch_persons_by_name_and_phonenumber($name: String!, $phonenumber: String!){
        fetch_persons_by_name_and_phonenumber(name:$name, phonenumber:$phonenumber){
            success
            msg
            persons {
                id
                name 
                phonenumber 
                email
                gender
            }
        }
    }
`

// fetch_persons_by_name
export const FETCH_PERSONS_BY_NAME = gql`
    query fetch_persons_by_name($name: String!){
        fetch_persons_by_name(name: $name){
            success
            msg
            persons {
                id
                name 
                phonenumber 
                email
                gender
            }
        }
    }
`

// query_instructors_allowed_to_teach_apprentice_with_name
export const QUERY_INSTRUCTORS_ALLOWED_TO_TEACH_APPRENTICE_WITH_NAME = gql`
    query query_instructors_allowed_to_teach_apprentice_with_name($name: String!){
        query_instructors_allowed_to_teach_apprentice_with_name(name: $name){
            success
            msg
            instructors {
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
                allow_teach_apprentice
            }
        }
    }
`


// query_attendance_info_of_lessonid
export const QUERY_ATTENDANCE_INFO_OF_LESSONID = gql`
query query_attendance_info_of_lessonid($lessonid:Int!){
    query_attendance_info_of_lessonid(lessonid: $lessonid){
        success
        msg
        attendance_info {
            attendance_id
            clientid
            clientname
            clientphonenumber
            checkin_time
        }
    }
}
`

// create_normal_lesson_attendance'
export const CREATE_NORMAL_LESSON_ATTENDANCE = gql`
    mutation create_normal_lesson_attendance($lessonid:Int!, $clientid: Int!){
        create_normal_lesson_attendance(lessonid: $lessonid, clientid: $clientid){
            success
            msg
        }
    }
`


export const REMOVE_NORMAL_LESSON_ATTENDANCE = gql`
    mutation remove_normal_lesson_attendance($lessonid: Int!, $clientid: Int!){
        remove_normal_lesson_attendance(lessonid: $lessonid, clientid: $clientid){
            success
            msg
        }
    }
`

export const FETCH_APPRENTICE_LESSON_BY_LESSONID = gql`
    query fetch_apprentice_lesson_by_lessonid($lessonid: Int!){
        fetch_apprentice_lesson_by_lessonid(lessonid: $lessonid){
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
                ticket_id_arr
            }
        }
    }
`


export const FETCH_TICKET_AVAIL_PLAN_AND_TICKETID_ARR_OF_APPRENTICE_INSTRUCTOR_AND_LESSON_TYPE = gql`
    query fetch_ticket_avail_plan_and_ticketid_arr_of_apprentice_instructor_and_lesson_type($apprentice_instructor_id: Int!, $activity_type: String!, $grouping_type: String!){
        fetch_ticket_avail_plan_and_ticketid_arr_of_apprentice_instructor_and_lesson_type(apprentice_instructor_id: $apprentice_instructor_id, activity_type: $activity_type, grouping_type: $grouping_type){
            success
            msg
            plan_and_tickets {
                planid
                total_rounds
                avail_tickets {
                    id
                    expire_time
                }
            }
        }
    }
`


export const UPDATE_APPRENTICE_LESSON_OVERALL = gql`
    mutation update_apprentice_lesson_overall($lessonid: Int!, $ticket_id_arr: [Int!], $starttime: String!, $duration: Int!){
        update_apprentice_lesson_overall(lessonid: $lessonid, ticket_id_arr: $ticket_id_arr, starttime: $starttime, duration: $duration){
            success
            msg
        }
    }
`

export const UPDATE_NORMAL_PLAN_TYPES = gql`
    mutation update_normal_plan_types($planid: Int!, $types:[IncomingPlanType]){
        update_normal_plan_types(planid: $planid, types:$types){
            success
            msg
        }
    }
`

export const FETCH_APPRENTICE_COURSE_INFO = gql`
    query fetch_apprentice_course_info($id: Int!){
        fetch_apprentice_course_info(id:$id){
            success 
            msg
            course {
                id
                name
            }
        }
    }
`

export const UPDATE_APPRENTICE_COURSE = gql`
    mutation update_apprentice_course($id: Int!, $name: String!){
        update_apprentice_course(id:$id, name: $name){
            success 
            msg
        }
    }
`

export const FETCH_APPRENTICE_PLAN_BY_ID = gql`
    query fetch_apprentice_plan_by_id($id: Int!){
        fetch_apprentice_plan_by_id(id:$id){
            success 
            msg
            plan {
                id
                apprentice_instructor_name
                apprentice_instructor_id
                apprentice_instructor_phonenumber
                activity_type
                grouping_type
                created
                totalcost
                rounds
                tickets{
                    id
                    expire_time
                    consumed_time
                }

            }
        }
    }
`

export const DELETE_APPRENTICE_PLAN = gql`
mutation delete_apprentice_plan($id: Int!){
    delete_apprentice_plan(id:$id){
        success 
        msg
    }
}
`
