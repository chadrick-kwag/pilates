import React, { useState, useEffect } from 'react'
import { DialogContent, DialogActions, Button, CircularProgress, List, ListItem } from '@material-ui/core'

import client from '../../../../apolloclient'
import { FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES } from '../../../../common/gql_defs'

import { DateTime } from 'luxon'




export default function AddTicketView(props) {

    console.log(props)
    console.log(props.existingTicketIdArr)

    const [plans, setPlans] = useState(null)

    const format_date = (d) => {
        console.log(d)
        return DateTime.fromISO(d).toFormat('y-LL-dd HH:mm')
    }

    const get_fastest_expiretime_ticket = (tickets) => {
        const _tickets = [...tickets]

        _tickets.sort((a, b) => {
            if (a.expire_time > b.expire_time) {
                return -1
            }
            else if (a.expire_time === b.expire_time) {
                return 0
            }
            else {
                return 1
            }
        })

        return _tickets[0].expire_time
    }

    useEffect(() => {

        const _var = {
            clientid: props.clientid,
            activity_type: props.activity_type,
            grouping_type: props.grouping_type,
            excluded_ticket_id_arr: props.selected_ticket_id_arr
        }
        client.query({
            query: FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.success) {

                const data = res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.plans

                // remove existing ticket
                const new_data = []

                for (let i = 0; i < data.length; i++) {
                    const a = data[i]

                    const new_tickets = []

                    // redo tickets, remove if ticket has same id as existing ticket id arr
                    for (let j = 0; j < a.tickets.length; j++) {
                        let match_exist = false
                        for (let k = 0; k < props.existingTicketIdArr.length; k++) {
                            if (a.tickets[j].id === props.existingTicketIdArr[k]) {
                                match_exist = true
                                break
                            }
                        }

                        if (!match_exist) {
                            new_tickets.push(a.tickets[j])
                        }
                    }

                    if (new_tickets.length > 0) {
                        a.tickets = new_tickets
                        new_data.push(a)
                    }

                }

                setPlans(new_data)
            }
            else {
                alert('fetch plans fail')
            }


        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch plans error')
        })
    }, [])

    if (plans === null) {
        return (
            <>
                <CircularProgress />
            </>
        )
    }
    else {

        return (
            <>
                <DialogContent>
                    <List>
                        {plans.map(p => <ListItem button onClick={() => {
                            console.log('clicked')
                            props.onTicketAdd?.(p.tickets[0].id)
                        }}>
                            <span>잔여횟수: {p.tickets.length}/{p.plan_total_rounds}, 가장빠른만료기한:{format_date(get_fastest_expiretime_ticket(p.tickets))}</span>
                        </ListItem>)}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => props.onCancel?.()}>취소</Button>
                </DialogActions>

            </>
        )
    }

}