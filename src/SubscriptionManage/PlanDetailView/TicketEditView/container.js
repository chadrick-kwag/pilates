import React, { useState, useEffect } from 'react'

import { DialogActions, DialogContent, Table, TableRow, TableCell, CircularProgress, Button, Dialog } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';

import client from '../../../apolloclient'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID, UPDATE_EXPDATE_OF_TICKETS } from '../../../common/gql_defs'
import { DateTime } from 'luxon'

import EditTicketList from '../../EditTicketList'
import EditTicketTable from './EditTicketTable'


import ExpireTimeChangeDialog from './ExpireTimeChangeDialog'


export default function Container(props) {

    const [tickets, setTickets] = useState(null)
    const [selectedTicketIdArr, setSelectedTicketIdArr] = useState([])
    const [showExpireTimeModal, setShowExpireTimeModal] = useState(false)


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

    useEffect(() => {
        fetch_tickets()
    }, [])

    const cols = [
        { field: 'id', headerName: "ticket id", flex: 1 },

        {
            field: 'expire_time', headerName: "만료일시",
            valueFormatter: a => DateTime.fromMillis(parseInt(a.value)).setZone('UTC+9').toFormat('y-LL-dd HH:mm'),
            flex: 1
        },
        {
            field: 'consumed_date',
            headerName: '소모된 수업시작일시',
            valueFormatter: a => {
                if (a !== null) {
                    DateTime.fromMillis(parseInt(a.value)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')
                }
                else {
                    return a
                }
            },
            flex: 1
        },
        {
            field: 'created_date', headerName: '생성일시', valueFormatter: a => {
                let b = DateTime.fromMillis(parseInt(a.value)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')
                return b
            },
            flex: 1
        },
        {
            field: 'destroyed_date', headerName: "양도된일시",
            valueFormatter: a => {
                if (a !== null) {
                    DateTime.fromMillis(parseInt(a.value)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')
                }
                else {
                    return a
                }
            },
            flex: 1
        }
    ]



    return (
        <>
            <DialogContent>
                {tickets === null ? <CircularProgress /> : <EditTicketTable tickets={tickets} onSelectChanged={d => setSelectedTicketIdArr(d)} />
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onCancel?.()}>취소</Button>
                <Button disabled={selectedTicketIdArr.length < 1}>티켓삭제</Button>
                <Button disabled={selectedTicketIdArr.length < 1}>티켓양도</Button>
                <Button>티켓추가</Button>
                <Button disabled={selectedTicketIdArr.length < 1} onClick={() => setShowExpireTimeModal(true)}>만료일시변경</Button>
            </DialogActions>

            { showExpireTimeModal ? <ExpireTimeChangeDialog onClose={() => setShowExpireTimeModal(false)} onDone={d => {
                console.log(d)
                request_expdate_update(d, () => {
                    setShowExpireTimeModal(false)
                    setTickets(null)
                    fetch_tickets()
                }, () => {
                    alert('update expire time fail')
                })
            }} /> : null}
        </>
    )
}