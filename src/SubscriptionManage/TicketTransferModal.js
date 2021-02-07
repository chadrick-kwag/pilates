import React, {useState} from 'react'
import { Modal, Button } from 'react-bootstrap'
import client from '../apolloclient'
import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import {TRANSFER_TICKETS_TO_CLIENTID} from '../common/gql_defs'



export default function TicketTransferModal(props) {

    console.log('inside ticket transfer modal')
    console.log(props)

    const [selectedClient, setSelectedClient] = useState({})

    const submit_transfer = ()=>{

        console.log('inside submit transfer')

        client.mutate({
            mutation: TRANSFER_TICKETS_TO_CLIENTID,
            variables: {
                ticket_id_list: props.selected_ticket_id_list,
                clientid: parseInt(selectedClient.id)
            },
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)

            if(res.data.transfer_tickets_to_clientid.success){
                props.onSuccess()
            }
            else{
                alert('submit failed')
            }


        }).catch(e=>{
            console.log(JSON.stringify(e))
            alert('submit error')
        })
    }

    return <Modal show={true} onHide={props.onCancel}>
        <Modal.Body>
            <ClientSearchComponent2 apolloclient={client} clientSelectedCallback={d=>{
                console.log(d)
                setSelectedClient(d)
            }}/>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={_=>props.onCancel()}>cancel</Button>
            <Button disabled={selectedClient.id===undefined} onClick={submit_transfer}>submit</Button>
        </Modal.Footer>

    </Modal>


}