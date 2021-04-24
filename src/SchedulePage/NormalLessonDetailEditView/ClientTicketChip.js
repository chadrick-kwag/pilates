import React from 'react'
import { Button, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';

import './ClientTicketChip.css'

export default function ClientTicketChip(props) {

    console.log(props)

    // calculate ticket circles
    const slot_total = Math.max(props.slotTotal, props.tickets.length)


    const get_circles = () => {
        const out = []

        for (let i = 0; i < slot_total; i++) {
            if (i < props.tickets.length && i < props.slotTotal) {
                out.push(<div className='ticket-circle ticket-valid'></div>)
            }
            else if (i < props.tickets.length && i >= props.slotTotal) {
                out.push(<div className='ticket-circle ticket-invalid'></div>)
            }
            else if (i >= props.tickets.length && i < props.slotTotal) {
                out.push(<div className='ticket-circle ticket-empty'></div>)
            }

        }

        return out
    }

    return (
        <div className='chip-container'>
            <span className='chip-text'>{props.name}({props.phonenumber})</span>
            {get_circles()}

            <div>
                <EditIcon fontsize={'22px'} className='action-button' onClick={() => props.onEditClientTickets?.()} />
            </div>

            <div onClick={() => {
                props.onDeleteClientTickets?.()
                console.log('clicked')
            }} >
                <CloseIcon fontsize={'22px'} className='action-button' />
            </div>


        </div>
    )
}