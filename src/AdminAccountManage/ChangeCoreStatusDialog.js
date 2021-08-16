
import React, { useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { UPDATE_CORE_STATUS_OF_ADMIN_ACCOUNT } from '../common/gql_defs'


function ChangeCoreStatusDialog({ onClose, onSuccess, mode, accountId }) {


    const request_core_status_change = () => {
        client.mutate({
            mutation: UPDATE_CORE_STATUS_OF_ADMIN_ACCOUNT,
            variables: {
                id: accountId,
                status: mode === 'setCore'
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.update_core_status_of_admin_account.success) {
                onSuccess?.()
            }
            else {
                alert('update core status fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('update core status error')
        })
    }

    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            {mode === 'setCore' ? <span>코어 어드민으로 승격시키겠습니까?</span> : <span>코어 어드민 자격을 박탈하겠습니까?</span>}
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => request_core_status_change()}>예</Button>
            <Button variant='outlined' onClick={onClose}>아니오</Button>
        </DialogActions>
    </Dialog>
}


export default ChangeCoreStatusDialog