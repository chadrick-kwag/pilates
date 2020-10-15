

function incoming_time_string_to_postgres_epoch_time(time_str) {
    let a = new Date(time_str)
    return a.getTime() / 1000
}


function parse_incoming_gender_str(gender_str) {
    if (gender_str == null) {
        return null
    }

    let gender = null
    if (gender_str.toLowerCase() == 'male') {
        gender = 'MALE'
    }
    else if (gender_str.toLowerCase() == 'female') {
        gender = 'FEMALE'
    }

    return gender

}

function parse_incoming_date_utc_string(date_utc_str) {
    // return epoch seconds
    if (date_utc_str == null) {
        return null
    }

    return new Date(date_utc_str).getTime() / 1000


}

module.exports={
    parse_incoming_date_utc_string,
    parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time
}