import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import client from '../apolloclient'
import TimeKeeper from 'react-timekeeper';
import { DateTimePicker } from "@material-ui/pickers";
import {UPDATE_EXPDATE_OF_TICKETS} from '../common/gql_defs'



export default function TicketExpDateChangeModal(props) {


    const [newdate, setNewDate] = useState(props.default_date)


    const submit_change_expdate = ()=>{


        client.mutate({
            mutation: UPDATE_EXPDATE_OF_TICKETS,
            variables:{
                ticket_id_list: props.selected_ticket_id_list,
                new_expdate: newdate.toUTCString()
            },
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)

            if(res.data.update_expdate_of_tickets.success){
                props.onSuccess()
            }
            else{
                alert('submit failed')
            }

        }).catch(e=>{
            console.log(e)
            console.log(JSON.stringify(e))
            alert('submit error')
        })
    }


    return <Modal show={true} onHide={props.onCancel}>
        <Modal.Body>
            <div className='row-gravity-center'>
                <h2>새로운 만료 기간</h2>
            </div>
            <div className='col-gravity-center'>
                <DateTimePicker
                    autoOk
                    ampm={false}
                    variant = 'static'
                    value={newdate}
                    onChange={e=>{
                        console.log(e)
                        setNewDate(e)
                    }}
                    
                />
            </div>

        </Modal.Body>
        <Modal.Footer>
            <Button onClick={e => props.onCancel()}>cancel</Button>
            <Button onClick={_=>submit_change_expdate()}>submit</Button>
        </Modal.Footer>
    </Modal>
}