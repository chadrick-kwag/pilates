import React, { useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { DELETE_ADMIN_ACCOUNT } from '../common/gql_defs'


function DeleteAdminAccountDialog({ open, onClose, username, accountId, onSuccess }) {

    const request_delete = () => {
        client.mutate({
            mutation: DELETE_ADMIN_ACCOUNT,
            variables: {
                id: accountId
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.delete_admin_account.success) {
                onSuccess?.()
            }
            else {
                alert('delete fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('delete error')
        })
    }

    return <Dialog open={open} onClose={onClose}>
        <DialogContent>
            <span>{username} 관리자 계정을 삭제하시겠습니까?</span>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={request_delete}>예</Button>
            <Button variant='outlined' onClick={onClose}>아니오</Button>
        </DialogActions>

    </Dialog>
}

export default DeleteAdminAccountDialog