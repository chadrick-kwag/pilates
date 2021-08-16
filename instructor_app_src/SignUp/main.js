import React, { useState } from 'react'
import { Button, Table, TableRow, TableCell, TextField } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { REQUEST_ADMIN_ACCOUNT_CREATION } from '../common/gql_defs'

function SignUpPage({ history }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repassword, setRepassword] = useState("")
    const [contact, setContact] = useState("")

    const submit_btn_disabled = () => {
        if (username === "" || password === "" || repassword === "" || contact === "") {
            return true
        }

        if (password !== repassword) {
            return true
        }

        return false
    }


    const create_user = () => {
        client.mutate({
            mutation: REQUEST_ADMIN_ACCOUNT_CREATION,
            variables: {
                username: username,
                password: password,
                contact: contact
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.request_admin_account_creation.success) {
                alert('계정신청 완료되었습니다')
                history.push('/login')
            }
            else {

                const msg = res.data.request_admin_account_creation.msg
                if (msg === 'username exist') {
                    alert('이미 계정명으로 신청되어 있습니다')
                }
                else {
                    alert('계정 신청 실패')
                }

            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('계정 신청 에러')
        })
    }

    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', wordBreak: 'keep-all', padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>아트필라테스 관리자 계정생성</span>
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
                <TableRow>
                    <TableCell style={{ wordBreak: 'keep-all' }}>
                        연락번호
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' value={contact} onChange={a => setContact(a.target.value)} onKeyDown={e => {
                            if (e.key === 'Enter') {
                                if (!submit_btn_disabled()) {
                                    create_user()
                                }
                            }
                        }} />
                    </TableCell>
                </TableRow>

            </Table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
            <Button variant='outlined' disabled={submit_btn_disabled()} onClick={() => create_user()}>계정신청</Button>
        </div>


    </div>
}


export default withRouter(SignUpPage)