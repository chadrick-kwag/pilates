import React, { useState, useEffect } from 'react'

import { DialogActions, DialogContent, Table, TableRow, TableCell, CircularProgress, Button, Dialog } from '@material-ui/core'


import client from '../../../apolloclient'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID, UPDATE_EXPDATE_OF_TICKETS, DELETE_TICKETS } from '../../../common/gql_defs'
import { DateTime } from 'luxon'

import EditTicketTable from './EditTicketTable'


import ExpireTimeChangeDialog from './ExpireTimeChangeDialog'
import TicketTransferDialog from './TicketTransferDialog'
import AddTicketDialog from './AddTicketDialog'


export default function Container(props) {

    const [tickets, setTickets] = useState(null)
    const [selectedTicketIdArr, setSelectedTicketIdArr] = useState([])
    const [showExpireTimeModal, setShowExpireTimeModal] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [showAddTicketModal, setShowAddTicketModal] = useState(false)

    const fetch_tickets = () => {

        client.query({
            query: FETCH_TICKETS_FOR_SUBSCRIPTION_ID,
            variables: {
                subscription_id: props.planid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_tickets_for_subscription_id.success) {
                setTickets(res.data.fetch_tickets_for_subscription_id.tickets)
            }
            else {
                alert(`fetch tickets failed msg: ${res.data.fetch_tickets_for_subscription_id.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch tickets error')
        })
    }


    const request_expdate_update = (new_date, success_callback, fail_callback) => {

        if (selectedTicketIdArr.length < 1) {
            alert('선택된 티켓이 없음')
            fail_callback()
            return
        }

        const _var = {
            ticket_id_list: selectedTicketIdArr,
            new_expdate: new_date.toUTCString()
        }

        console.log('_var')
        console.log(_var)

        client.mutate({
            mutation: UPDATE_EXPDATE_OF_TICKETS,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.update_expdate_of_tickets.success) {
                success_callback?.()
            }
            else {
                fail_callback?.()
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            fail_callback?.()
        })
    }


    const request_delete_tickets = () => {


        if (selectedTicketIdArr.length < 1) {
            alert('선택된 티켓이 없음')
            fail_callback()
            return
        }

        const _var = {
            ticketid_arr: selectedTicketIdArr
        }

        client.mutate({
            mutation: DELETE_TICKETS,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.delete_tickets.success) {
                props.onEditSuccess?.()
                setTickets(null)
                fetch_tickets()

            }
            else {
                alert(`delete ticket failed. msg: ${res.data.delete_tickets.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('delete ticket error')
        })

    }

    useEffect(() => {
        fetch_tickets()
    }, [])



    return (
        <>
            <DialogContent>
                {tickets === null ? <CircularProgress /> : <EditTicketTable tickets={tickets} onSelectChanged={d => setSelectedTicketIdArr(d)} />
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onCancel?.()}>취소</Button>
                <Button disabled={selectedTicketIdArr.length < 1} onClick={() => request_delete_tickets()}>티켓삭제</Button>
                <Button disabled={selectedTicketIdArr.length < 1} onClick={() => setShowTransferModal(true)}>티켓양도</Button>
                <Button onClick={() => setShowAddTicketModal(true)}>티켓추가</Button>
                <Button disabled={selectedTicketIdArr.length < 1} onClick={() => setShowExpireTimeModal(true)}>만료일시변경</Button>
            </DialogActions>

            { showExpireTimeModal ? <ExpireTimeChangeDialog onClose={() => setShowExpireTimeModal(false)} onDone={d => {
                console.log(d)
                request_expdate_update(d, () => {
                    setShowExpireTimeModal(false)
                    setTickets(null)
                    fetch_tickets()
                    props.onEditSuccess?.()
                }, () => {
                    alert('update expire time fail')
                })
            }} /> : null}


            {showTransferModal ? <TicketTransferDialog ticketIdArr={selectedTicketIdArr} onClose={() => setShowTransferModal(false)} onSuccess={() => {
                setTickets(null)
                fetch_tickets()
                setShowTransferModal(false)
                props.onEditSuccess?.()
            }} /> : null}

            {showAddTicketModal ? <AddTicketDialog planid={props.planid} onClose={() => setShowAddTicketModal(false)}
                onSuccess={() => {
                    setTickets(null)
                    fetch_tickets()
                    setShowAddTicketModal(false)
                    props.onEditSuccess?.()
                }}
            /> : null}
        </>
    )
}