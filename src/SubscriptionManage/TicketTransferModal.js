import React, {useState} from 'react'
import { Modal, Button } from 'react-bootstrap'
import client from '../apolloclient'
import ClientSearchComponent2 from '../components/ClientSearchComponent2'



export default function TicketTransferModal(props) {

    console.log('inside ticket transfer modal')

    const [selectedClient, setSelectedClient] = useState({})

    const submit_transfer = ()=>{

        console.log('inside submit transfer')
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