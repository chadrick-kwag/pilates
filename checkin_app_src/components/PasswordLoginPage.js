import React, { useState } from 'react'
import { CircularProgress, TextField, Button } from '@material-ui/core'
import client from '../apolloclient'
import { GET_NEW_TOKEN } from '../common/gql_defs'
import { useMutation } from '@apollo/client'
import { withRouter } from 'react-router-dom'

function PasswordLoginPage({ history }) {

    const [password, setPassword] = useState("")

    const [getToken, { loading }] = useMutation(GET_NEW_TOKEN, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.get_new_token.success) {

                sessionStorage.setItem('checkin-auth-token', d.get_new_token.token)
                history.push('/')
            }
            else {
                alert('접속 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('접속 에러')
        }
    })


    const button_disable_handler = () => {
        if (password === "") {
            return true
        }

        return false
    }

    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ marginRight: '1rem' }}>비밀번호</span>
                <TextField variant='outlined' type='password' value={password} onChange={a => setPassword(a.target.value)} />

            </div>
            <Button disabled={button_disable_handler()} variant='outlined' onClick={() => getToken({
                variables: {
                    password: password
                }
            })}>{loading ? <CircularProgress /> : <span>ok</span>}</Button>
        </div>

    </div>
}


export default withRouter(PasswordLoginPage)