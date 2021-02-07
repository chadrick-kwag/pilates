import React, { useState } from 'react'
import { Spinner, Table, Form, Button } from 'react-bootstrap'

import { get_null_safe_date_format } from '../common/date_fns'
import TicketTransferModal from './TicketTransferModal'


function EditTicketList(props) {

    let selectlist_length = 0
    if (props.tickets !== null && props.tickets !== undefined) {
        selectlist_length = props.tickets.length
    }
    const [selectlist, setSelectList] = useState(new Array(selectlist_length).fill(false))
    const [showTransferMOdal, setShowTransferModal] = useState(false)
    const [showExpDateChangeModal, setShowExpDateChangeModal] = useState(false)
    const [allselect, setAllSelect] = useState(false)

    if (props.tickets === null || props.tickets === undefined) {
        return <div><Spinner></Spinner></div>
    }
    else if (props.tickets.length == 0) {
        return <div>no tickets</div>
    }
    else {
        // there are tickets.

        let at_least_one_selected = false
        for (let i = 0; i < selectlist.length; i++) {
            if (selectlist[i]) {
                at_least_one_selected = true
                break
            }
        }

        return <div>

            {showTransferMOdal? <TicketTransferModal onCancel={()=>setShowTransferModal(false)}/> : null}
            {showExpDateChangeModal? null : null}

            <div className='row-gravity-right'>
                <Button disabled={!at_least_one_selected} onClick={_=>setShowTransferModal(true)}>양도</Button>
                <Button disabled={!at_least_one_selected} onClick={_=>setShowExpDateChangeModal(true)}>유통기한 변경</Button>
            </div>


            <Table >

                <thead>
                    <th>
                        <div>
                            <Form.Check checked={allselect} onClick={_ => {
                                let changed_val = !allselect

                                if (changed_val === true) {
                                    let new_selectlist = new Array(selectlist.length).fill(true)
                                    setSelectList(new_selectlist)
                                }
                                else if (changed_val === false) {
                                    let new_selectlist = new Array(selectlist.length).fill(false)
                                    setSelectList(new_selectlist)
                                }

                                setAllSelect(changed_val)
                            }} />


                        </div>
                    </th>
                    <th>expire time</th>
                    <th>created</th>
                    <th>consumed by</th>
                    <th>destroyed</th>
                </thead>
                <tbody>
                    {props.tickets.map((d, index) => {
                        let tr_classname = ""
                        let expire_date = new Date(parseInt(d.expire_time))
                        if (expire_date < new Date()) {
                            tr_classname = "table-row-expired"
                        }
                        let is_expired = expire_date < new Date()
                        let can_edit = true
                        if (is_expired) {
                            can_edit = false
                        }
                        if (d.consumed_date !== null) {
                            can_edit = false
                        }
                        return <tr className={tr_classname}>
                            <td><Form.Check disabled={!can_edit} checked={selectlist[index]} onClick={() => {
                                let newvalue = !selectlist[index]

                                let new_select_list = Array.from(selectlist)
                                new_select_list[index] = newvalue
                                setSelectList(new_select_list)

                            }} /></td>
                            <td>{get_null_safe_date_format(d.expire_time, '-')}</td>
                            <td>{get_null_safe_date_format(d.created_date, '-')}</td>
                            <td>{get_null_safe_date_format(d.consumed_date, '-')}</td>
                            <td>{get_null_safe_date_format(d.destroyed_date, '-')}</td>
                        </tr>
                    })}
                </tbody>

            </Table></div>
    }


}


export default EditTicketList