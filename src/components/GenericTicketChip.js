import React from 'react'
import { Button, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';

import './GenericTicketChip.css'
import PropTypes from 'prop-types'

function GenericTicketChip({ slotTotal, tickets, isError, name, phonenumber, onEditClientTickets, onDeleteClientTickets }) {

    // calculate ticket circles
    const slot_total = Math.max(slotTotal || 0, tickets?.length || 0)


    const get_circles = () => {
        const out = []

        for (let i = 0; i < slot_total; i++) {
            if (i < tickets.length && i < slotTotal) {
                out.push(<div className='ticket-circle ticket-valid'></div>)
            }
            else if (i < tickets.length && i >= slotTotal) {
                out.push(<div className='ticket-circle ticket-invalid'></div>)
            }
            else if (i >= tickets.length && i < slotTotal) {
                out.push(<div className='ticket-circle ticket-empty'></div>)
            }

        }

        return out
    }

    return (
        <div className='chip-container' style={(() => {
            if (isError) {
                return {
                    backgroundColor: 'red'
                }
            }
        })()}>
            <span className='chip-text'>{name}({phonenumber})</span>
            {get_circles()}

            <div>
                <EditIcon fontsize={'22px'} className='action-button' onClick={() => onEditClientTickets?.()} />
            </div>

            <div onClick={() => {
                onDeleteClientTickets?.()
            }} >
                <CloseIcon fontsize={'22px'} className='action-button' />
            </div>


        </div>
    )
}

GenericTicketChip.propTypes = {
    slotTotal: PropTypes.number,
    tickets: PropTypes.array,
    isError: PropTypes.bool,
    name: PropTypes.string,
    phonenumber: PropTypes.string,
    onEditClientTickets: PropTypes.func,
    onDeleteClientTickets: PropTypes.func
}


export default GenericTicketChip