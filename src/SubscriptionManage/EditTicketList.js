import React, { useState } from 'react'
import { Spinner, Table, Form, Button } from 'react-bootstrap'

import { get_null_safe_date_format } from '../common/date_fns'
import TicketTransferModal from './TicketTransferModal'


function EditTicketList(props) {

    console.log(`edit ticket list props: `)
    console.log(props)


    let init_selectlist = []
    let curr_date = new Date()
    if(props.tickets !== null && props.tickets !== undefined){
        for(let i=0;i<props.tickets.length;i++){
            let sel_ticket = props.tickets[i]

            let is_edit_possible = true
            console.log('sel ticket')
            console.log(sel_ticket)

            if(sel_ticket.consumed_date!==null){
                is_edit_possible= false
            }
            let expdate = new Date(parseInt(sel_ticket.expire_time))
            if(curr_date > expdate){
                is_edit_possible = false
            }

            console.log(sel_ticket.destroyed_date)
            if(sel_ticket.destroyed_date!==null){
                is_edit_possible = false
            }

            if(!is_edit_possible){
                init_selectlist.push(null)
            }
            else{
                init_selectlist.push(false)
            }
        }
    }

    console.log("init_selectlist")
    console.log(init_selectlist)

    const [selectlist, setSelectList] = useState(init_selectlist)
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

        let selected_ticket_id_list = []
        for(let i=0;i< selectlist.length; i++){

            if(!selectlist[i]){
                continue
            }

            let s_ticket = props.tickets[i]

            selected_ticket_id_list.push(s_ticket.id)
        }

        console.log(`selected_ticket_id_list: ${selected_ticket_id_list}`)

        return <div>

            {showTransferMOdal? <TicketTransferModal onCancel={()=>setShowTransferModal(false)} selected_ticket_id_list={selected_ticket_id_list}/> : null}
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

                                let new_selectlist = Array.from(selectlist)
                                new_selectlist = new_selectlist.map(a=>{
                                    if(a===null){
                                        return a
                                    }
                                    else{
                                        return changed_val
                                    }
                                })
                                setSelectList(new_selectlist)
                                setAllSelect(changed_val)
                            }} />


                        </div>
                    </th>
                    <th>만료 일시</th>
                    <th>생성 일시</th>
                    <th>소모 일시</th>
                    <th>양도 일시</th>
                </thead>
                <tbody>
                    {props.tickets.map((d, index) => {
                        let tr_classname = ""
                        let expire_date = new Date(parseInt(d.expire_time))
                        if (expire_date < new Date()) {
                            tr_classname = "table-row-expired"
                        }
                        // let is_expired = expire_date < new Date()
                        
                        return <tr className={tr_classname}>
                            <td><Form.Check disabled={selectlist[index]===null} checked={selectlist[index]} onClick={() => {
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