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
                alert('계정 생성 성공')
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

        <div>
            <Table>

                <TableRow>
                    <TableCell>
                        <span>username</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' value={username} onChange={a => setUsername(a.target.value)} />
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        <span>password</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={password} onChange={a => setPassword(a.target.value)} />
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        <span>re-enter password</span>
                    </TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={repassword} onChange={a => setRepassword(a.target.value)} />
                    </TableCell>
                </TableRow>

            </Table>
        </div>


        <Button disabled={submit_btn_disabled()} onClick={() => create_user()}>생성</Button>

    </div>
}


export default withRouter(SignUpPage)