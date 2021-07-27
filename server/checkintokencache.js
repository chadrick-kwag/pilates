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

module.exports = {
    add_token,
    check_token
}