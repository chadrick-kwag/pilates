import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { CHECK_INSTRUCTOR_APP_TOKEN } from '../common/gql_defs'
import { CircularProgress } from '@material-ui/core'
import { useLazyQuery } from '@apollo/client'

function AuthenticateWrapper({ children, history }) {
    // const [token, setToken] = useState(null)
    const [isValid, setIsValid] = useState(false)
    const [loading, setLoading] = useState(true)

    const [checkToken, { loading: fetch_loading, data, error }] = useLazyQuery(CHECK_INSTRUCTOR_APP_TOKEN, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.check_instructor_app_token.success === false) {

                localStorage.removeItem('instructor-auth-token')
                history.push('/login')
            }

            setLoading(false)

        }
    })

    useEffect(() => {


        const authtoken = localStorage.getItem('instructor-auth-token')

        console.log('authtoken')
        console.log(authtoken)

        if (authtoken === null || authtoken === undefined) {
            history.push('/login')
            setLoading(false)
            return
        }

        checkToken({
            variables: {
                token: authtoken
            }
        })

    }, [])

    if (loading) {

        return <div className='fwh flex jc ac'>
            <CircularProgress />
        </div>
    }
    else {


        if (data?.check_instructor_app_token?.success === true) {
            return children
        }

        return null

    }

}

export default withRouter(AuthenticateWrapper)