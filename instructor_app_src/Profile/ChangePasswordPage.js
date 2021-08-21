import React, { useState } from 'react'
import client from '../apolloclient'
import { Table, TableRow, TableCell, Button, TextField } from '@material-ui/core'
import { useMutation } from '@apollo/client'
import { CHANGE_PASSWORD_OF_INSTRUCTOR_APP_ACCOUNT } from '../common/gql_defs'
import { withRouter } from 'react-router-dom'

function ChangePasswordPage({ history }) {

    const [currentpw, setCurrentpw] = useState("")
    const [newpw, setNewpw] = useState("")
    const [newpwrepeat, setNewpwrepeat] = useState("")


    const [requestChange, { loading, error }] = useMutation(CHANGE_PASSWORD_OF_INSTRUCTOR_APP_ACCOUNT, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.change_password_of_instructor_app_account.success) {
                history.goBack()
            }
            else {
                alert('변경 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('변경 에러')
        }
    })


    const submit_btn_disable_handler = () => {
        if (currentpw === "" || newpw === "" || newpwrepeat === "") return true

        if (newpw !== newpwrepeat) return true

        return false
    }

    return (
        <div className='fwh flex flex-col'>

            <div className='flex flex-row jc ac vmargin-0.5rem'>
                <span>비밀변호 변경</span>
            </div>

            <Table>
                <TableRow>
                    <TableCell>현재 비밀번호</TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={currentpw} onChange={e => setCurrentpw(e.target.value)} />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>변경 비밀번호</TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={newpw} onChange={e => setNewpw(e.target.value)} />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>변경 비밀번호 재입력</TableCell>
                    <TableCell>
                        <TextField variant='outlined' type='password' value={newpwrepeat} onChange={e => setNewpwrepeat(e.target.value)} />
                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row jc ac gap vmargin-0.5rem'>
                <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
                <Button variant='outlined' disabled={submit_btn_disable_handler()} onClick={() => {
                    requestChange({
                        variables: {
                            current_pw: currentpw,
                            new_password: newpw
                        }
                    })
                }}>변경</Button>
            </div>

        </div>
    )
}

export default withRouter(ChangePasswordPage)
