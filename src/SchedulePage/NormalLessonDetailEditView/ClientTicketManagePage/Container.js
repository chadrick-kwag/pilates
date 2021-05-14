import React, { useState } from 'react'

import { DialogContent, DialogActions, Button, Table, TableRow, TableCell, List, ListItem, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';

import BaseView from './BaseView'
import AddTicketView from './AddTicketView'


export default function Container(props) {

    console.log('container')
    console.log(props)

    const [tickets, setTickets] = useState(props.clientTickets.tickets)
    const [viewMode, setViewMode] = useState('base')

    if (viewMode === 'base') {
        return <BaseView
            clientname={props.clientTickets.clientname}
            tickets={tickets}
            totalLimit={props.durationHours}
            setTickets={setTickets}
            onCancel={props.onCancel}
            onAddClick={() => setViewMode('addticket')}
            onEditDone={() => {
                console.log(tickets)
                props.onEditDone?.(tickets)
            }}
        />
    }

    if (viewMode === 'addticket') {
        return <AddTicketView
            clientid={props.clientTickets.clientid}
            activity_type={props.activity_type}
            grouping_type={props.grouping_type}
            existingTicketIdArr={tickets.map(d=>d.ticketid)}
            onTicketAdd={t => {
                console.log('ticket selected. ticket id:')
                console.log(t)
                const _tickets = [...tickets, { ticketid: t }]
                setTickets(_tickets)
                setViewMode('base')
            }}
            onCancel={() => setViewMode('base')}
        />
    }

}