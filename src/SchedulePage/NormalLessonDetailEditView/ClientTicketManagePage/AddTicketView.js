import React, { useState, useEffect } from 'react'
import { DialogContent, DialogActions, Button, CircularProgress, List, ListItem } from '@material-ui/core'

import client from '../../../apolloclient'
import { FETCH_TICKET_AVAILABLE_PLAN_FOR_CLIENTID_AND_LESSONTYPES } from '../../../common/gql_defs'

export default function AddTicketView(props) {

    console.log(props)

    const [plans, setPlans] = useState(null)

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
                setPlans(res.data.fetch_ticket_available_plan_for_clientid_and_lessontypes.plans)
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
                        {plans.map(p => <ListItem button onClick={() => props.onTicketAdd?.(p.ticket_id_arr[0])}>
                            <span>planid: {p.planid}</span>
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