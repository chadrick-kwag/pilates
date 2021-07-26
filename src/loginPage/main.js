import React, { useState } from 'react'
import { Button, TextField, Table, TableRow, TableCell } from '@material-ui/core'
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
                alert('로그인 실패')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('로그인 에러')
        })
    }

    return <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>아트필라테스 관리자 로그인</span>
            </div>
            <div>

                <Table>
                    <TableRow>
                        <TableCell>
                            아이디
                        </TableCell>
                        <TableCell>
                            <TextField style={{ width: '100%' }} variant='outlined' value={username} onChange={a => setUsername(a.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            비밀번호
                        </TableCell>
                        <TableCell>
                            <TextField style={{ width: '100%' }} type='password' variant='outlined' value={password} onChange={a => setPassword(a.target.value)} />
                        </TableCell>
                    </TableRow>
                </Table>


            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                <Button style={{ marginLeft: '1rem', marginRight: '1rem' }} variant='outlined' disabled={submit_btn_disabled()} onClick={() => submit()}>로그인</Button>
                <Button style={{ marginLeft: '1rem', marginRight: '1rem' }} variant='outlined' onClick={() => history.push('/signup')}>계정만들기</Button>
            </div>

        </div>


    </div>
}


export default withRouter(MainPage)