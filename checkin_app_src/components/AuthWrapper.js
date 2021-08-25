import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { CircularProgress } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import { CHECK_TOKEN } from '../common/gql_defs'
import client from '../apolloclient'


function AuthWrapper({ history, children }) {

    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(true)
    
    const token = sessionStorage.getItem('checkin-auth-token')



    const [checkToken, { error }] = useLazyQuery(CHECK_TOKEN, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.check_token.success) {
                setValid(d.check_token.is_valid)
                setLoading(false)

            }
            else {
                alert('token check failed')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('token check error')
        }
    })

    useEffect(() => {

        if (token) {
            checkToken({
                variables: {
                    token: token
                }
            })
        }
        else {
            setLoading(false)
        }


    }, [])


    const redirect = () => {
        history.push('/login')
    }

    if (loading) {
        return <CircularProgress />

    }
    else {

        if (!token) {

            // redirect to login page

            redirect()
            return null
        }
        else {
            if (valid) {
                return <>{children}</>
            }
            else {
                // redirect to login page
                // invalid token remove token.
                localStorage.removeItem('checkin-auth-token')
                redirect()
                return null
            }
        }
    }


}


export default withRouter(AuthWrapper)