import React, { useState, useEffect } from 'react'
import { Table, TableCell, TableRow, Button, CircularProgress } from '@material-ui/core'
import client from '../../apolloclient'

import { FETCH_APPRENTICE_PLAN_BY_ID, FETCH_APPRENTICE_TICKETS_OF_PLAN } from '../../common/gql_defs'


import DetailView from './DetailView'
import DetailEdit from './DetailEdit'
import TicketEdit from './TicketEdit'

export default function DetailViewComponent(props) {

    const [appInst, setAppInst] = useState(null)
    const [loading, setLoading] = useState(true)
    const [totalCost, setTotalCost] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [created, setCreated] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [tickets, setTickets] = useState(null)

    const [editMode, setEditMode] = useState('none')


    const fetch_tickets = () => {
        client.query({
            query: FETCH_APPRENTICE_TICKETS_OF_PLAN,
            variables: {
                id: props.id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_apprentice_tickets_of_plan.success) {
                setRounds(res.data.fetch_apprentice_tickets_of_plan.tickets.length)
                setTickets(res.data.fetch_apprentice_tickets_of_plan.tickets)
            }
            else {
                alert(`fetch ticket fail. msg: ${res.data.fetch_apprentice_tickets_of_plan.msg}`)
            }
        }).catch(e => {
            console.log(e)
            alert('fetch ticket error')
        })
    }

    const fetch_data = () => {

        client.query({
            query: FETCH_APPRENTICE_PLAN_BY_ID,
            variables: {
                id: props.id
            },
            fetchPolicy: 'no-cache'

        }).then(res => {
            console.log(res)
            if (res.data.fetch_apprentice_plan_by_id.success) {
                let d = res.data.fetch_apprentice_plan_by_id.plans[0]

                // setRounds(d.rounds)
                setCreated(d.created)
                setTotalCost(d.totalcost)
                setAppInst({
                    id: d.apprentice_instructor_id,
                    name: d.apprentice_instructor_name,
                    phonenumber: d.apprentice_instructor_phonenumber
                })
                setActivityType(d.activity_type)
                setGroupingType(d.grouping_type)

                setLoading(false)

                fetch_tickets()
            }
            else {
                alert('fetch data fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            alert('fetch data error')
        })
    }

    useEffect(() => {
        fetch_data()

    }, [])


    return (
        <div className='col-gravity-center' style={{ width: '100%', height: '100%' }}>

            {loading ? <CircularProgress /> :

                (() => {
                    if (editMode === 'none') {
                        return <DetailView
                            data={{
                                appInst: appInst,
                                totalCost: totalCost,
                                rounds: rounds,
                                activityType: activityType,
                                groupingType: groupingType,
                                tickets: tickets
                            }}

                            onCancel={() => props.onCancel?.()}
                            onEdit={() => setEditMode('basic_edit')}
                            onTicketEdit={() => setEditMode('ticket_edit')}
                        />
                    }
                    else if (editMode === 'basic_edit') {
                        return <DetailEdit data={{
                            appInst: appInst,
                            totalCost: totalCost,
                            rounds: rounds,
                            activityType: activityType,
                            groupingType: groupingType
                        }}

                            onCancel={() => setEditMode('none')}
                            onSuccess={() => {
                                setLoading(true)
                                fetch_data()
                                setEditMode('none')
                            }}

                        />
                    }
                    else if (editMode === 'ticket_edit') {
                        return <TicketEdit planid={props.id} refreshTickets={() => fetch_data()} tickets={tickets} onCancel={() => setEditMode('none')} />
                    }

                    return null
                })()
            }

        </div>
    )
}