

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


function ensure_admin_account_id_in_context(context) {
    if (context.account_id === null) {
        return false
    }
    return true
}

module.exports = {
    parse_incoming_date_utc_string: parse_incoming_date_utc_string,
    parse_incoming_gender_str: parse_incoming_gender_str,
    incoming_time_string_to_postgres_epoch_time: incoming_time_string_to_postgres_epoch_time,
    ensure_admin_account_id_in_context
}