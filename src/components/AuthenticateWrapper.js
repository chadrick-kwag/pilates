import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { CHECK_AUTHTOKEN_VALID } from '../common/gql_defs'
import { CircularProgress } from '@material-ui/core'

function AuthenticateWrapper({ children, history }) {
    const [token, setToken] = useState(null)
    const [isValid, setIsValid] = useState(false)
    const [loading, setLoading] = useState(true)


    const check_authtoken_valid = (token) => {
        client.query({
            query: CHECK_AUTHTOKEN_VALID,
            variables: {
                token: token
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.check_authtoken.success) {
                setIsValid(true)
                setLoading(false)
            }
            else {
                setIsValid(false)
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            setLoading(false)
        })
    }

    useEffect(() => {
        const authtoken = localStorage.getItem('pilates-auth-token')

        if (authtoken === null || authtoken === undefined) {
            setLoading(false)
            return
        }

        setToken(authtoken)

        check_authtoken_valid(authtoken)

    }, [])



    if (loading) {

        return <>
            <CircularProgress />
        </>
    }
    else {

        if (token === null) {
            console.log('redirect to login')
            history.push('/login')
            return null
        }
        else {
            if (isValid) {
                return <>
                    {children}
                </>
            }
            else {
                // delete token
                console.log('auth token invalid detected. delete token and redirect to login page')

                localStorage.removeItem('pilates-auth-token')
                history.push('/login')
                return null
            }
        }




    }

}

export default withRouter(AuthenticateWrapper)