import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogActions, Button, Select, MenuItem } from '@material-ui/core'
import PT from 'prop-types'
import { DateTime } from 'luxon'


const process_data = (current_ticket_id_arr, planAndTickets) => {

    const processed_plan_and_tickets = []

    planAndTickets.forEach(a => {
        const avail_tickets = a.avail_tickets
        const planid = a.planid

        const new_avail_tickets = []

        avail_tickets.forEach(b => {
            if (current_ticket_id_arr.includes(b.id)) {
                return
            }
            else {
                new_avail_tickets.push(b)
            }

        })

        if (new_avail_tickets.length === 0) {
            return
        }
        else {

            // sort tickets by expire time
            new_avail_tickets.sort((a, b) => {
                return parseInt(a.expire_time) < parseInt(b.expire_time)
            })
            const new_plan = { ...a, avail_tickets: new_avail_tickets }
            processed_plan_and_tickets.push(new_plan)
        }


    })


    return processed_plan_and_tickets


}


function TicketManageModal({ current_ticket_id_arr, planAndTickets, slotsize, onCancel, onTicketSelected }) {

    console.log('TicketManageModal')
    console.log(current_ticket_id_arr)
    console.log(planAndTickets)

    const [selectedIndex, setSelectedIndex] = useState(null)


    const processed_plan_and_tickets = process_data(current_ticket_id_arr, planAndTickets)
    console.log('processed_plan_and_tickets')
    console.log(processed_plan_and_tickets)

    return <Dialog open={true} onClose={onCancel}>


        <DialogContent>

            <Select value={selectedIndex} onChange={e => setSelectedIndex(e.target.value)}>
                {processed_plan_and_tickets.map((d, i) => {
                    return <MenuItem value={i}>{`플랜:${d.planid}(${d.avail_tickets.length}/${d.total_rounds})/가장빠른유효기간:${DateTime.fromMillis(parseInt(d.avail_tickets[0].expire_time)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}`}</MenuItem>
                })}
            </Select>

        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => onCancel?.()}>이전</Button>
            <Button variant='outlined' disabled={selectedIndex === null} onClick={() => {
                const selected_ticket_id = processed_plan_and_tickets[selectedIndex].avail_tickets[0].id
                onTicketSelected?.(selected_ticket_id)
            }}>완료</Button>
        </DialogActions>



    </Dialog>

}

TicketManageModal.propTypes = {
    current_ticket_id_arr: PT.array.isRequired,
    planAndTickets: PT.array.isRequired,
    slotsize: PT.number.isRequired,
    onCancel: PT.func,
    onTicketSelected: PT.func.isRequired
}


export default TicketManageModal