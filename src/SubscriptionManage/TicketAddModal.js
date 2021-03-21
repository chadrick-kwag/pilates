import React, { useState } from 'react'

import { Modal, Button, Form } from 'react-bootstrap'
import { DateTime } from 'luxon'
import client from '../apolloclient'
import { DateTimePicker } from "@material-ui/pickers";
import { DatePicker } from '@material-ui/pickers'


export default function TicketAddModal(props) {


    const [createCount, setCreateCount] = useState(null)
    const [expireDate, setExpireDate] = useState(DateTime.local())


    const submit_add_tickets = () => {
        console.log('aa')
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