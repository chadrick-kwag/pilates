import React, { useState } from 'react'
import { CircularProgress, Dialog, DialogContent, DialogActions, TextField, Button } from '@material-ui/core'
import client from '../apolloclient'
import { CHANGE_MY_ADMIN_ACCOUNT_PASSWORD } from '../common/gql_defs'
import { useMutation  } from '@apollo/client';


function ChangePasswordDialog({ onClose, onSuccess }) {

    const [updatePW, { loading, data, error }] = useMutation(CHANGE_MY_ADMIN_ACCOUNT_PASSWORD, {
        fetchPolicy: 'no-cache', client: client
    })
    const [currentpw, setCurrentpw] = useState("")
    const [newpw, setNewpw] = useState("")
    const [renewpw, setReNewpw] = useState("")


    const request_pwchange = () => {
        updatePW({
            variables: {
                existpassword: currentpw,
                newpassword: newpw
            }
        })
    }


    const submit_btn_disabled = () => {
        if (currentpw === '' || newpw === '' || renewpw === '') {
            return true
        }

        if (newpw !== renewpw) {
            return true
        }

        return false
    }

    if(data && data.change_my_admin_account_password.success){
        onSuccess?.()
        return null
    }

    return <Dialog open={true}>
        <DialogContent>
            {loading ? <div>
                <CircularProgress />
            </div> : <div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <span>기존 비밀번호</span>
                    <TextField variant='outlined' type='password' value={currentpw} onChange={a => setCurrentpw(a.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <span>새로운 비밀번호</span>
                    <TextField variant='outlined' type='password' value={newpw} onChange={a => setNewpw(a.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <span>새로운 비밀번호 재입력</span>
                    <TextField variant='outlined' type='password' value={renewpw} onChange={a => setReNewpw(a.target.value)} />
                </div>
            </div>}

        </DialogContent>
        <DialogActions>
            <Button disabled={submit_btn_disabled()} variant='outlined' onClick={() => request_pwchange()}>변경</Button>
            <Button variant='outlined' onClick={onClose}>취소</Button>
        </DialogActions>
    </Dialog>

}


export default ChangePasswordDialog