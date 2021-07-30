import { gql } from '@apollo/client'




export const QUERY_LESSON_WITH_DATERANGE_GQL = gql`query($start_time: String!, $end_time: String!){
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