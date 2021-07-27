const token_cache = {}
const id_to_token_cache = {}

const add_token_for_id = (token, id) => {
    token_cache[token] = id
    id_to_token_cache[id] = token
}

const remove_token_for_id = (id) => {
    const t = id_to_token_cache[id]
    if (t) {
        delete id_to_token_cache[id]
        delete token_cache[t]
    }
}


const get_account_id_for_token = (token) => {
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
    add_token_for_id,
    remove_token_for_id,
    get_account_id_for_token
}