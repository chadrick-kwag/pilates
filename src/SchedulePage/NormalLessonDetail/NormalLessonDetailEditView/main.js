import React, { useState, useEffect } from 'react'

import { DateTime, Duration } from 'luxon'

import BaseView from './BaseView'
import AddClientView from './AddClientView'
import ChangeInstructorView from './ChangeInstructorView'

import { CircularProgress, DialogContent } from '@material-ui/core'

import client from '../../../apolloclient'
import { QUERY_LESSON_DETAIL_WITH_LESSONID, CHANGE_NORMAL_LESSON_OVERALL } from '../../../common/gql_defs'
import ClientTicketMangePage from './ClientTicketManagePage/Container'

import { useQuery } from '@apollo/client'
import PT from 'prop-types'

function NormalLessonDetailEditView({ lessonid, onEditDone, onCancel }) {

    const [instructor, setInstructor] = useState(null)

    const [startTime, setStartTime] = useState(null)
    const [durationHours, setDurationHours] = useState(null)
    const [clients, setClients] = useState([])
    const [clientsAndTickets, setClientsAndTickets] = useState(null)

    const [viewMode, setViewMode] = useState('base')

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)

    const [clientTicketsIndexToEdit, setClientTicketsIndexToEdit] = useState(null)


    const { loading, error, data: initialData } = useQuery(QUERY_LESSON_DETAIL_WITH_LESSONID, {
        client: client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: lessonid
        },
        onCompleted: res => {
            console.log(res)

            if (res.query_lesson_detail_with_lessonid.success == false) {
                return alert('데이터 조회 실패')
            }

            const d = res.query_lesson_detail_with_lessonid.detail

            // distribute data to each states
            setActivityType(d.activity_type)
            setGroupingType(d.grouping_type)
            setInstructor({
                id: d.instructorid,
                phonenumber: d.instructorphonenumber,
                name: d.instructorname
            })

            setStartTime(DateTime.fromMillis(parseInt(d.starttime)).setZone('UTC+9'))

            const _st = DateTime.fromMillis(parseInt(d.starttime))
            const et = DateTime.fromMillis(parseInt(d.endtime))

            const duration = et.diff(_st)
            const hours = duration.as('hours')

            setDurationHours(hours)
            setClientsAndTickets(d.client_info_arr)

            setData(d)

        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('데이터 조회 에러')
        }
    })



    const [data, setData] = useState(null)


    const request_update = () => {

        const duration = Duration.fromMillis(0).set({ hours: durationHours })
        let endtime = startTime.plus(duration)

        console.log(clientsAndTickets)


        const _cts = clientsAndTickets.map(d => {
            console.log(d)
            return {
                clientid: d.clientid,
                tickets: d.ticketid_arr
            }
        })

        const _var = {
            lessonid: lessonid,
            instructorid: instructor.id,
            client_tickets: _cts,
            starttime: startTime.toSQL(),
            endtime: endtime.toSQL()
        }

        console.log('_var')
        console.log(_var)

        client.mutate({
            mutation: CHANGE_NORMAL_LESSON_OVERALL,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.change_lesson_overall.success) {
                onEditDone?.()
            }
            else {
                alert('submit change fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('submit change error')
        })
    }


    if (loading) {
        return <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></DialogContent>
    }

    if (error || initialData?.query_lesson_detail_with_lessonid?.success === false) {
        return <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ padding: '2rem' }}>에러</span>
        </DialogContent>
    }

    if (viewMode === 'base') {

        return <BaseView
            clientsAndTickets={clientsAndTickets}
            activity_type={activityType}
            grouping_type={groupingType}
            onAddClient={() => setViewMode('add_client')} setClients={setClients} setStartTime={setStartTime} setDurationHours={setDurationHours} clients={clients} durationHours={durationHours} startTime={startTime}
            setClientsAndTickets={setClientsAndTickets}
            onChangeInstructor={() => setViewMode('change_instructor')}
            instructor={instructor}
            onCancel={onCancel}
            switchToClientTicketEditMode={index => {
                setClientTicketsIndexToEdit(index)
                setViewMode('client_ticket_manage')
            }}
            onRequestChange={() => request_update()}
        />
    }

    if (viewMode === 'add_client') {
        return <AddClientView onCancel={() => setViewMode('base')} onDone={d => {
            const _d = d
            _d.ticketid_arr = []
            _d.clientid = _d.id
            const new_clientsAndTickets = [...clientsAndTickets, _d]

            setClientsAndTickets(new_clientsAndTickets)
            setViewMode('base')
        }} />
    }

    if (viewMode === 'client_ticket_manage') {
        return <ClientTicketMangePage
            clientTickets={clientsAndTickets[clientTicketsIndexToEdit]}
            durationHours={durationHours}
            activity_type={activityType}
            grouping_type={groupingType}
            onEditDone={ticket_id_arr => {
                const _clientsAndTickets = [...clientsAndTickets]
                _clientsAndTickets[clientTicketsIndexToEdit].ticketid_arr = ticket_id_arr

                setClientsAndTickets(_clientsAndTickets)
                setClientTicketsIndexToEdit(null)
                setViewMode('base')

            }}
            onCancel={() => {
                setClientTicketsIndexToEdit(null)
                setViewMode('base')
            }}
        />
    }

    if (viewMode === 'change_instructor') {
        return <ChangeInstructorView onCancel={() => setViewMode('base')} onDone={d => {
            setInstructor(d)
            setViewMode('base')
        }} />
    }

}


NormalLessonDetailEditView.propTypes = {
    lessonid: PT.func.isRequired,
    onEditDone: PT.func.isRequired,
    onCancel: PT.func.isRequired
}

export default NormalLessonDetailEditView