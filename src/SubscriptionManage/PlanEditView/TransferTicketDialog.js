import React, { useState } from 'react'
import { TRANSFER_TICKETS_TO_CLIENTID } from '../../common/gql_defs'
import { Button, Dialog, DialogContent, DialogActions } from '@material-ui/core'
import client from '../../apolloclient'
import ClientSearchComponent from '../../components/ClientSearchComponent4'
import { useMutation } from '@apollo/client'

function TransferTicketDialog({ onClose, onSuccess, ticketIds }) {


    const [receiver, setReceiver] = useState(null)

    const [doTransfer, { loading, error }] = useMutation(TRANSFER_TICKETS_TO_CLIENTID, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.transfer_tickets_to_clientid?.success) {
                onSuccess?.()
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })




    const is_submit_disabled = () => {
        if (receiver === null) return true

        return false
    }

    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            <ClientSearchComponent onClientSelected={c => {
                console.log(c)
                setReceiver(c)
            }} />
        </DialogContent>
        <DialogActions>
            <Button>취소</Button>
            <Button disabled={is_submit_disabled()} onClick={() => {
                doTransfer({
                    variables: {
                        ticket_id_list: ticketIds,
                        clientid: receiver.id
                    }
                })
            }}>양도</Button>
        </DialogActions>

    </Dialog>
}


export default TransferTicketDialog