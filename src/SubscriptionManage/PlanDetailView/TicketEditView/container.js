import React, { useState, useEffect } from 'react'

import { DialogActions, DialogContent, Table, TableRow, TableCell, CircularProgress, Button } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';

import client from '../../../apolloclient'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID } from '../../../common/gql_defs'
import { DateTime } from 'luxon'

import EditTicketList from '../../EditTicketList'
import EditTicketTable from './EditTicketTable'



export default function Container(props) {

    const [tickets, setTickets] = useState(null)


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

    console.log(tickets)

    return (
        <>
            <DialogContent>
                {tickets === null ? <CircularProgress /> : <EditTicketTable  tickets={tickets}/>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onCancel?.()}>취소</Button>
                <Button>티켓삭제</Button>
                <Button>티켓양도</Button>
                <Button>티켓추가</Button>
                <Button>만료일시변경</Button>
            </DialogActions>
        </>
    )
}