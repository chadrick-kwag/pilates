import React, { useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { CHANGE_ADMIN_ACCOUNT_PASSWORD } from '../common/gql_defs'

function ResetPasswordModal({ onClose, open, accountId, onSuccess }) {

    const [password, setPassword] = useState("")


    const request_reset = () => {

        client.mutate({
            mutation: CHANGE_ADMIN_ACCOUNT_PASSWORD,
            variables: {
                id: accountId,
                password: password
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.change_admin_account_password.success) {
                onSuccess?.()
            }
            else {
                alert('reset fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('reset error')
        })


    }


    const submit_disabled_func = () => {
        if (password === "") {
            return true
        }
        return false
    }

    return <Dialog onClose={onClose} open={open}>
        <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ marginRight: '1rem' }}>새 비밀번호</span>
                <TextField variant='outlined' value={password} onChange={a => setPassword(a.target.value)} />
            </div>
        </DialogContent>

        <DialogActions>
            <Button disabled={submit_disabled_func()} onClick={request_reset} >리셋</Button>
            <Button onClick={onClose}>닫기</Button>
        </DialogActions>

    </Dialog >

}


export default ResetPasswordModal