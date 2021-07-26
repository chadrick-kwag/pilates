import React, { useState } from 'react'
import { Grid, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { TRY_LOGIN } from '../common/gql_defs'
import { withRouter } from 'react-router-dom'


function MainPage({ history }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const submit_btn_disabled = () => {
        if (username === "" || password === "") {
            return true
        }
        return false
    }

    const submit = () => {
        client.query({
            query: TRY_LOGIN,
            variables: {
                username: username,
                password: password
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.try_login.success) {
                localStorage.setItem('pilates-auth-token', res.data.try_login.token)
                localStorage.setItem('pilates-username', res.data.try_login.username)
                history.push('/')
            }
            else {
                alert('login failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('login submit error')
        })
    }

    return <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

        <Grid container justifyContent='center' alignItems='center'>
            <Grid item xs={0} s={3}>
            </Grid>
            <Grid item xs={12} s={6}>
                <Grid container justifyContent='center' alignItems='center'>

                    <Grid item style={{ display: 'flex', flexDirection: "row-reverse", paddingRight: "1rem" }} xs={4}>
                        username
                    </Grid>
                    <Grid item xs={8}>
                        <TextField variant='outlined' value={username} onChange={a => setUsername(a.target.value)} />
                    </Grid>
                    <Grid item style={{ display: 'flex', flexDirection: "row-reverse", paddingRight: "1rem" }} xs={4}>
                        password
                    </Grid>
                    <Grid item xs={8}>
                        <TextField type='password' variant='outlined' value={password} onChange={a => setPassword(a.target.value)} />
                    </Grid>
                    <Grid item style={{ display: 'flex', justifyContent: 'center' }} xs={12}>
                        <Button variant='outlined' disabled={submit_btn_disabled()} onClick={() => submit()}>login</Button>
                        <Button variant='outlined' onClick={() => history.push('/signup')}>Signup</Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={0} s={3}>
            </Grid>

        </Grid>

    </div>
}


export default withRouter(MainPage)