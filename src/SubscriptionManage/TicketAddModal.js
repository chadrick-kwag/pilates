import React, { useState } from 'react'

import { Modal, Button, Form } from 'react-bootstrap'
import { DateTime } from 'luxon'
import client from '../apolloclient'
import { DateTimePicker } from "@material-ui/pickers";
import { DatePicker } from '@material-ui/pickers'
import { ADD_TICKETS } from '../common/gql_defs'


export default function TicketAddModal(props) {


    const [createCount, setCreateCount] = useState(null)
    const [expireDate, setExpireDate] = useState(DateTime.local())


    const submit_add_tickets = () => {

        let v = {
            planid: props.planid,
            addsize: parseInt(createCount),
            expire_datetime: expireDate.setZone('UTC+9').toISO()
        }
        console.log(v)
        console.log('aa')
        client.mutate({
            mutation: ADD_TICKETS,
            variables: v,
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)

            if(res.data.add_tickets.success){
                props.onSuccess?.()
            }
            else{
                alert('add ticket failed')
            }
        }).catch(e=>{
            console.log(JSON.stringify(e))
            alert('add ticket error')
        })

    }


    return (
        <Modal show={true} onHide={props.onCancel}>
            <Modal.Body>
                <div>
                    <span>생성 개수</span>
                    <Form.Control value={createCount} onChange={e => setCreateCount(e.target.value)} />

                </div>
                <div className='row-gravity-center'>
                    <h2>새로운 만료 기간</h2>
                </div>
                <div className='col-gravity-center'>

                    <DatePicker
                        autoOk
                        orientation="landscape"
                        variant="static"
                        openTo="date"
                        value={expireDate}
                        onChange={d => {
                            console.log(d)
                            let a = DateTime.fromJSDate(d)
                            setExpireDate(a)
                        }}
                    />
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e => props.onCancel?.()}>cancel</Button>
                <Button onClick={_ => submit_add_tickets()}>submit</Button>
            </Modal.Footer>
        </Modal>
    )
}