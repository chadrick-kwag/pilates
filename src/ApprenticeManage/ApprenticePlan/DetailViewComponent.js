import React, { useState, useEffect } from 'react'
import { Table, TableCell, TableRow, Button, CircularProgress } from '@material-ui/core'
import client from '../../apolloclient'

import { FETCH_APPRENTICE_PLAN_BY_ID } from '../../common/gql_defs'


import DetailView from './DetailView'
import DetailEdit from './DetailEdit'

export default function DetailViewComponent(props) {

    const [appInst, setAppInst] = useState(null)
    const [loading, setLoading] = useState(true)
    const [totalCost, setTotalCost] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [created, setCreated] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)

    const [editMode, setEditMode] = useState(false)

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

                setRounds(d.rounds)
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
        <div className='col-gravity-center'>

            {loading ? <CircularProgress /> : editMode ? <DetailEdit data={{
                appInst: appInst,
                totalCost: totalCost,
                rounds: rounds,
                activityType: activityType,
                groupingType: groupingType
            }}

                onCancel={() => setEditMode(false)}
                onSuccess={() => {
                    setLoading(true)
                    fetch_data()
                    setEditMode(false)
                }}

            /> : <DetailView
                data={{
                    appInst: appInst,
                    totalCost: totalCost,
                    rounds: rounds,
                    activityType: activityType,
                    groupingType: groupingType
                }}

                onCancel={() => props.onCancel?.()}
                onEdit={() => setEditMode(true)}
            />}

        </div>
    )
}