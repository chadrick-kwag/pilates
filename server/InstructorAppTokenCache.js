const token_cache = {}
const id_to_token_cache = {}

const add_instructor_token_for_personid = (token, id) => {
    token_cache[token] = id
    id_to_token_cache[id] = token
}

const remove_token_for_personid = (id) => {
    const t = id_to_token_cache[id]
    if (t) {
        delete id_to_token_cache[id]
        delete token_cache[t]
    }
}


const get_instructor_app_personid_for_token = (token) => {
    // fetch id
    const id = token_cache[token]
    if (id) {
        // check if token is latest token
        const fetched_token = id_to_token_cache[id]
        if (fetched_token !== token) {

            return null
        }
        return id
    }
    return null
}

module.exports = {
    add_instructor_token_for_personid,
    remove_token_for_personid,
    get_instructor_app_personid_for_token
}