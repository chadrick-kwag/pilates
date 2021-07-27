import React, { useEffect, useState } from 'react'
import client from '../apolloclient'
import { CHECK_TOKEN_IS_CORE_ADMIN } from '../common/gql_defs'


function CoreAdminUserCheck({ children }) {

    const [loading, setLoading] = useState(true)
    const [iscore, setIsCore] = useState(false)

    useEffect(() => {
        client.query({
            query: CHECK_TOKEN_IS_CORE_ADMIN,
            variables: {
                token: localStorage.getItem('pilates-auth-token')
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.check_token_is_core_admin.success) {
                setIsCore(res.data.check_token_is_core_admin.is_core)
                setLoading(false)
            }
            else {
                
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            setLoading(false)
        })
    }, [])

    if (loading) {
        return null
    }
    else {
        if (iscore) {
            return children
        }
        else {
            return null
        }
    }

}


export default CoreAdminUserCheck