import React, { useState } from 'react'
import { Button, Table, TableRow, TableCell, TextField } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { CREATE_ACCOUNT } from '../common/gql_defs'

function SignUpPage({ history }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repassword, setRepassword] = useState("")

    const submit_btn_disabled = () => {
        if (username === "" || password === "" || repassword === "") {
            return true
        }

        if (password !== repassword) {
            return true
        }

        return false
    }


    const create_user = () => {
        client.mutate({
            mutation: CREATE_ACCOUNT,
            variables: {
                username: username,
                password: password
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.create_account.success) {
                history.push('/login')
            }
            else {
                alert('계정 생성 실패')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('계정 생성 에러')
        })
    }

    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>아트필라테스 관리자 계정생성</span>
        </div>

        <div>
            <Table>

                <TableRow>
                    <TableCell>
                        <span>아이디</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' value={username} onChange={a => setUsername(a.target.value)} />
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        <span>비밀번호</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={password} onChange={a => setPassword(a.target.value)} />
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        <span>비밀번호 재입력</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={repassword} onChange={a => setRepassword(a.target.value)} />
                    </TableCell>
                </TableRow>

            </Table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
            <Button variant='outlined' disabled={submit_btn_disabled()} onClick={() => create_user()}>생성</Button>
        </div>


    </div>
}


export default withRouter(SignUpPage)