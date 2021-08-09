import React, { useEffect, useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, List, ListItem, ListItemText, Select, MenuItem, CircularProgress } from '@material-ui/core'

import client from '../../apolloclient'
import { FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES } from '../../common/gql_defs'
import DeleteIcon from '@material-ui/icons/Delete';
import { DateTime } from 'luxon'
import { useQuery } from '@apollo/client'

import ErrorIcon from '@material-ui/icons/Error';
import PT from 'prop-types'

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

        let exptime_str = DateTime.fromISO(fastest_exptime).setZone('utc+9').toFormat('y-LL-dd HH:mm')
        return `플랜id:${o.planid}(${remain_rounds}/${totalrounds}) , 가장빠른만료일:${exptime_str}`
    }



    return <div className='row-gravity-center'>
        <Select value={selection}  >
            {props.options?.map((d, i) => <MenuItem onClick={() => {

                props.onDone?.(props.options[i].tickets[0].id)
            }} value={i}>{get_format_of_option(d)}</MenuItem>)}
        </Select>

    </div>
}


function SelectPlanAndTicketDialog({ tickets, totalSlotSize, clientid, activityType, groupingType, onClose, onDone }) {

    const [_tickets, setTickets] = useState(tickets) // array of ticket ids
    const [availableTicketInfo, setAvailableTicketInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(false)


    const [existingTicketsRemovedAvailableTicketInfo, setExistingTicketsRemovedAvailableTicketInfo] = useState(null)

    const generate_empty_slots = () => {

        if (_tickets.length < totalSlotSize) {
            const remain_size = totalSlotSize - _tickets.length
            const out = []
            for (let i = 0; i < remain_size; i++) {
                out.push(<ListItem>
                    <ListItemText>
                        <AddSlot key={i} options={existingTicketsRemovedAvailableTicketInfo} onDone={tid => {
                            const newarr = [..._tickets]
                            newarr.push(tid)
                            setTickets(newarr)
                        }} />
                    </ListItemText>
                </ListItem>)
            }

            return out
        }
        return null
    }

    useEffect(() => {
        if (availableTicketInfo === null) {
            setExistingTicketsRemovedAvailableTicketInfo(availableTicketInfo)
            return
        }

        if (_tickets.length === 0) {
            setExistingTicketsRemovedAvailableTicketInfo(availableTicketInfo)
            return
        }
        else {
            const plan_ticket_info = []

            for (let i = 0; i < availableTicketInfo.length; i++) {
                const p = availableTicketInfo[i]
                const filtered_tickets = []
                for (let j = 0; j < p.tickets.length; j++) {
                    let match_exist = false
                    for (let k = 0; k < _tickets.length; k++) {
                        if (_tickets[k] === p.tickets[j].id) {
                            match_exist = true
                            break
                        }

                    }

                    if (!match_exist) {
                        filtered_tickets.push(p.tickets[j])
                    }
                }


                if (filtered_tickets.length > 0) {
                    const new_plan = { ...p }
                    new_plan.tickets = filtered_tickets
                    plan_ticket_info.push(new_plan)
                }

            }

            setExistingTicketsRemovedAvailableTicketInfo(plan_ticket_info)
            return

        }



    }, [availableTicketInfo, _tickets])

    useEffect(() => {

        setIsLoading(true)

        const _var = {
            clientid: clientid,
            activity_type: activityType,
            grouping_type: groupingType,
            excluded_ticket_id_arr: _tickets
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
                        for (let k = 0; k < _tickets.length; k++) {
                            if (_tickets[k] === t.id) {
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
                    setAvailableTicketInfo(null)
                    setIsLoading(false)
                    return
                }

                setAvailableTicketInfo(newdata)
                setIsLoading(false)
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
        <Dialog open={true} onClose={() => onClose()}>
            <DialogContent>
                {isLoading ? <CircularProgress /> :
                    availableTicketInfo === null ? <ErrorIcon /> : <List>
                        {_tickets.map((d, i) => <ListItem>
                            <ListItemText>티켓ID: {d}</ListItemText>
                            <DeleteIcon onClick={() => {
                                const newarr = [..._tickets]
                                newarr.splice(i, 1)
                                setTickets(newarr)
                            }} />
                        </ListItem>)}
                        {generate_empty_slots()}
                    </List>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose?.()}>취소</Button>
                <Button onClick={() => onDone?.(_tickets)}>완료</Button>
            </DialogActions>
        </Dialog>
    )
}

SelectPlanAndTicketDialog.propTypes = {
    tickets: PT.array,
    totalSlotSize: PT.number,
    clientid: PT.number,
    activityType: PT.string,
    groupingType: PT.string,
    onClose: PT.func,
    onDone: PT.func
}

export default SelectPlanAndTicketDialog