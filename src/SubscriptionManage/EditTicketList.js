import React, { useState, useEffect } from 'react'
import { Spinner, Table, Form, Button } from 'react-bootstrap'

import TicketTransferModal from './TicketTransferModal'
import TicketExpDateChangeModal from './TicketExpDateChangeModal'

import client from '../apolloclient'
import { DELETE_TICKETS } from '../common/gql_defs'

import { DateTime } from 'luxon'
import TicketAddModal from './TicketAddModal'



function get_date_string(dt) {
    if (dt === null) {
        return '-'
    }
    else {
        return dt.toFormat('y-LL-dd HH:mm')
    }
}


function EditTicketList(props) {

    console.log(`edit ticket list props: `)
    console.log(props)

    const delete_selected_tickets = () => {

        console.log('delete_selected_tickets')

        // check at least one is selected

        let selected_ticket_id_arr = []

        selectlist.forEach((d, i) => {
            if (d) {
                selected_ticket_id_arr.push(props.tickets[i].id)
            }
        })

        console.log(`selected_ticket_id_arr : ${selected_ticket_id_arr}`)

        client.mutate({
            mutation: DELETE_TICKETS,
            variables: {
                ticketid_arr: selected_ticket_id_arr
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            console.log('inside response of delete tickets')

            if (res.data.delete_tickets.success) {
                console.log('delete tickets success')
                props.onDeleteTicketSuccess?.()
            }
            else {
                alert(`delete tickets fail. ${res.data.delete_tickets.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('delete tickets error')
        })


    }

    const create_more_tickets = () => {
        console.log('create_more_tickets')
        setShowAddTicketModal(true)
    }

    const calc_init_selectlist = () => {
        let init_selectlist = []
        let curr_date = DateTime.local()
        if (props.tickets !== null && props.tickets !== undefined) {
            for (let i = 0; i < props.tickets.length; i++) {
                let sel_ticket = props.tickets[i]

                let is_edit_possible = true
                console.log('sel ticket')
                console.log(sel_ticket)

                if (sel_ticket.consumed_date !== null) {
                    is_edit_possible = false
                }

                // not allow edit for expired tickets
                // let expdate = sel_ticket.expire_time
                // if (curr_date > expdate) {
                //     is_edit_possible = false
                // }

                console.log(sel_ticket.destroyed_date)
                if (sel_ticket.destroyed_date !== null) {
                    is_edit_possible = false
                }

                if (!is_edit_possible) {
                    init_selectlist.push(null)
                }
                else {
                    init_selectlist.push(false)
                }
            }
        }

        return init_selectlist

    }


    const [selectlist, setSelectList] = useState(calc_init_selectlist())
    const [showTransferMOdal, setShowTransferModal] = useState(false)
    const [showExpDateChangeModal, setShowExpDateChangeModal] = useState(false)
    const [allselect, setAllSelect] = useState(false)
    const [showAddTicketModal, setShowAddTicketModal] = useState(false)


    useEffect(() => {
        let new_selectlist = calc_init_selectlist()
        setSelectList(new_selectlist)
    }, [props.tickets])



    if (props.tickets === null || props.tickets === undefined) {
        return <div><Spinner animation='border' /></div>
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
        for (let i = 0; i < selectlist.length; i++) {

            if (!selectlist[i]) {
                continue
            }

            let s_ticket = props.tickets[i]

            selected_ticket_id_list.push(s_ticket.id)
        }

        console.log(`selected_ticket_id_list: ${selected_ticket_id_list}`)

        return <div>

            {showTransferMOdal ? <TicketTransferModal onCancel={() => setShowTransferModal(false)}
                selected_ticket_id_list={selected_ticket_id_list}
                onSuccess={() => {
                    setShowTransferModal(false)
                    props.refreshdata()
                }}
            /> : null}
            {showExpDateChangeModal ? <TicketExpDateChangeModal
                selected_ticket_id_list={selected_ticket_id_list}
                default_date={props.tickets[selectlist.indexOf(true)].expire_time}
                onCancel={_ => setShowExpDateChangeModal(false)}
                onSuccess={_ => {
                    setShowExpDateChangeModal(false)
                    props.refreshdata()
                }}
            /> : null}

            <div className='row-gravity-right'>
                <Button onClick={_ => create_more_tickets()}>추가</Button>
                <Button disabled={!at_least_one_selected} onClick={_ => delete_selected_tickets()}>삭제</Button>
                <Button disabled={!at_least_one_selected} onClick={_ => setShowTransferModal(true)}>양도</Button>
                <Button disabled={!at_least_one_selected} onClick={_ => setShowExpDateChangeModal(true)}>유통기한 변경</Button>
                <Button variant='warning' onClick={_ => props.onEscapeEditMode()}>변경취소</Button>
            </div>

            {showAddTicketModal ? <TicketAddModal 
            planid={props.planid}
            onCancel={() => setShowAddTicketModal(false)}
                onSuccess={() => {
                    setShowAddTicketModal(false)
                    props.refreshdata?.()
                }}
            /> : null}


            <Table >

                <thead>
                    <th>
                        <div>
                            <Form.Check checked={allselect} onClick={_ => {

                                let changed_val = !allselect

                                let new_selectlist = Array.from(selectlist)
                                new_selectlist = new_selectlist.map(a => {
                                    if (a === null) {
                                        return a
                                    }
                                    else {
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
                        let expire_date = d.expire_time
                        if (expire_date < DateTime.local()) {
                            tr_classname = "table-row-expired"
                        }

                        return <tr className={tr_classname}>
                            <td><Form.Check disabled={selectlist[index] === null}
                                checked={selectlist[index]} onClick={() => {
                                    let newvalue = !selectlist[index]

                                    let new_select_list = Array.from(selectlist)
                                    new_select_list[index] = newvalue
                                    setSelectList(new_select_list)

                                }} /></td>

                            <td>{get_date_string(d.expire_time)}</td>
                            <td>{get_date_string(d.created_date)}</td>
                            <td>{get_date_string(d.consumed_date)}</td>
                            <td>{get_date_string(d.destroyed_date)}</td>
                        </tr>
                    })}
                </tbody>

            </Table></div>
    }


}


export default EditTicketList