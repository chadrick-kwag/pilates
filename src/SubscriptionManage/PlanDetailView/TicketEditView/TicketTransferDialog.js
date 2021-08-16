import React, { useState } from 'react'


import { Dialog, DialogActions, Button, DialogContent } from '@material-ui/core'
import ClientSearchComponent4 from '../../../components/ClientSearchComponent4'

import client from '../../../apolloclient'

import { TRANSFER_TICKETS_TO_CLIENTID } from '../../../common/gql_defs'


export default function TicketTransferDialog(props) {

    const [receipient, setReceipient] = useState(null)


    const request_transfer = () => {

        // check inputs
        if (props.ticketIdArr === null) {
            alert('선택된 티켓이 없음')
            return
        }

        if (props.ticketIdArr.length === 0) {
            alert('선택된 티켓이 없음')
            return
        }

        if (receipient === null) {
            alert('양도받을 회원이 없음')
            return
        }

        const _var = {
            ticket_id_list: props.ticketIdArr,
            clientid: receipient.id
        }

        console.log(_var)

        client.mutate({
            mutation: TRANSFER_TICKETS_TO_CLIENTID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.transfer_tickets_to_clientid.success) {
                props.onSuccess?.()
            }
            else {
                alert(`transfer tickets failed. msg: ${res.data.transfer_tickets_to_clientid.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('transfer tickets error')
        })
    }

    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>
            <DialogContent>
                <ClientSearchComponent4 onClientSelected={u => setReceipient(u)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>취소</Button>
                <Button disabled={receipient === null} onClick={() => request_transfer()}>양도</Button>
            </DialogActions>
        </Dialog>
    )
}