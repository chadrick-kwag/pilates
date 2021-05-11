import React, { useEffect, useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, List, ListItem, ListItemText, Select, MenuItem } from '@material-ui/core'

import client from '../../apolloclient'
import { FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES } from '../../common/gql_defs'
import DeleteIcon from '@material-ui/icons/Delete';




function AddSlot(props) {

    const [selection, setSelection] = useState(null)

    const get_format_of_option = (o) => {
        let remain_rounds = o.tickets.length
        let totalrounds = o.plan_total_rounds
        let fastest_exptime = o.tickets.sort((a, b) => {
            const _a = a.expire_time
            const _b = b.expire_time

            if (_a < _b) {
                return -1
            }
            else if (_a === _b) {
                return 0
            }
            else {
                return 1
            }

        })[0].expire_time
        return `플랜id:${o.planid}(${remain_rounds}/${totalrounds}) ${fastest_exptime}`
    }



    return <div className='row-gravity-center'>
        <Select value={selection} onChange={e => setSelection(e.target.value)} >
            {props.options?.map((d, i) => <MenuItem value={i}>{get_format_of_option(d)}</MenuItem>)}
        </Select>

        <Button disabled={selection === null} onClick={() => props.onDone?.(props.options[selection].tickets[0].id)}>선택</Button>

    </div>
}


export default function SelectPlanAndTicketDialog(props) {

    console.log(props)

    const [tickets, setTickets] = useState(props.tickets) // array of ticket ids
    const [availableTicketInfo, setAvailableTicketInfo] = useState(null)

    const generate_empty_slots = () => {

        if (tickets.length < props.totalSlotSize) {
            const remain_size = props.totalSlotSize - tickets.length
            const out = []
            for (let i = 0; i < remain_size; i++) {
                out.push(<ListItem>
                    <ListItemText>
                        <AddSlot options={availableTicketInfo} onDone={tid => {
                            const newarr = [...tickets]
                            newarr.push(tid)
                            setTickets(newarr)
                            console.log(newarr)
                        }} />
                    </ListItemText>
                </ListItem>)
            }

            return out
        }
        return null
    }

    useEffect(() => {

        const _var = {
            clientid: props.clientid,
            activity_type: props.activityType,
            grouping_type: props.groupingType,
            excluded_ticket_id_arr: props.tickets
        }

        console.log(_var)
        client.query({
            query: FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.success) {

                const data = res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.plans

                console.log('original data')
                console.log(data)
                // remove already selected tickets

                const newdata = []
                for (let i = 0; i < data.length; i++) {
                    const d = data[i]

                    const new_ticket_arr = []

                    for (let j = 0; j < d.tickets.length; j++) {
                        const t = d.tickets[j]

                        let exists = false
                        for (let k = 0; k < tickets.length; k++) {
                            if (tickets[k] === t.id) {
                                exists = true
                                break
                            }
                        }

                        if (!exists) {
                            new_ticket_arr.push(t)
                        }
                    }


                    if (new_ticket_arr.length > 0) {
                        const new_plan = { ...d }

                        new_plan.tickets = new_ticket_arr

                        newdata.push(new_plan)
                    }
                }

                console.log('newdata')
                console.log(newdata)

                if (newdata.length == 0) {
                    alert('사용가능한 플랜이 없거나 모두 소진되었습니다.')
                    return
                }

                setAvailableTicketInfo(newdata)
            }
            else {
                alert(`fetch plan and tickets failed. msg:${res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.msg}`)
            }

        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch plan and tickets error')
        })
    }, [])

    return (
        <Dialog open={true} onClose={() => props.onClose()}>
            <DialogContent>
                <List>
                    {tickets.map((d, i) => <ListItem>
                        <ListItemText>티켓ID: {d}</ListItemText>
                        <DeleteIcon onClick={() => {
                            const newarr = [...tickets]
                            newarr.splice(i, 1)
                            setTickets(newarr)
                        }} />
                    </ListItem>)}
                    {generate_empty_slots()}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>취소</Button>
                <Button onClick={() => props.onDone?.(tickets)}>완료</Button>
            </DialogActions>
        </Dialog>
    )
}