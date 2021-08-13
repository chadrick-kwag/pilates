const token_cache = {}



const add_token = (t) => {
    token_cache[t] = true
}

const check_token = t => {

    if (token_cache[t]) {
        return true
    }

    return false
}


const add_instructor_app_token = (t) => {
    instructor_app_token_cache[t] = true
}

const check_instructor_app_token = t => {
    if (instructor_app_token_cache[t]) {
        return true
    }

    return false
}

module.exports = {
    token_cache,
    add_token,
    check_token,
    add_instructor_app_token,
    check_instructor_app_token
}