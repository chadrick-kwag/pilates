import React, { useState, useEffect } from 'react'

import { DateTime, Duration } from 'luxon'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box, CircularProgress } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import BaseView from './BaseView'
import AddClientView from './AddClientView'
import ChangeInstructorView from './ChangeInstructorView'


import client from '../../apolloclient'
import { QUERY_LESSON_DETAIL_WITH_LESSONID, CHANGE_NORMAL_LESSON_OVERALL } from '../../common/gql_defs'
import ClientTicketMangePage from './ClientTicketManagePage/Container'

export default function NormalLessonDetailEditView(props) {

    console.log('NormalLessonDetailEditView props')
    console.log(props)


    const [instructor, setInstructor] = useState({
        name: props.data.instructorname,
        phonenumber: props.data.instructorphonenumber,
        id: props.data.instructorid
    })

    const [startTime, setStartTime] = useState(null)
    const [durationHours, setDurationHours] = useState(null)
    const [clients, setClients] = useState(props.data.client_info_arr)
    const [clientsAndTickets, setClientsAndTickets] = useState(null)

    const [viewMode, setViewMode] = useState('base')

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)

    const [clientTicketsIndexToEdit, setClientTicketsIndexToEdit] = useState(null)



    const [data, setData] = useState(null)


    const request_update = () => {

        const duration = Duration.fromMillis(0).set({ hours: durationHours })
        let endtime = startTime.plus(duration)

        const _cts = clientsAndTickets.map(d => {
            return {
                clientid: d.clientid,
                tickets: d.tickets.map(a => a.ticketid)
            }
        })

        const _var = {
            lessonid: props.data.indomain_id,
            instructorid: instructor.id,
            client_tickets: _cts,
            starttime: startTime.toSQL(),
            endtime: endtime.toSQL()
        }



        client.mutate({
            mutation: CHANGE_NORMAL_LESSON_OVERALL,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.change_lesson_overall.success) {
                props.onEditDone?.()
            }
            else {
                alert('submit change fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('submit change error')
        })
    }

    useEffect(() => {
        client.query({
            query: QUERY_LESSON_DETAIL_WITH_LESSONID,
            variables: {
                lessonid: props.data.indomain_id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.query_lesson_detail_with_lessonid.success) {
                const d = res.data.query_lesson_detail_with_lessonid.detail

                // distribute data to each states
                setActivityType(d.activity_type)
                setGroupingType(d.grouping_type)

                setStartTime(DateTime.fromMillis(parseInt(d.starttime)).setZone('UTC+9'))

                const _st = DateTime.fromMillis(parseInt(d.starttime))
                const et = DateTime.fromMillis(parseInt(d.endtime))

                const duration = et.diff(_st)
                const hours = duration.as('hours')

                setDurationHours(hours)
                setClientsAndTickets(d.client_tickets)

                setData(d)
            }
            else {
                alert('fetch lesson info fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch lesson info error')
        })
    }, [])



    if (viewMode === 'base') {
        console.log('inside viewmode base')
        console.log(clientsAndTickets)
        return <BaseView instructor={props.instructor}
            clientsAndTickets={clientsAndTickets}
            activity_type={activityType}
            grouping_type={groupingType}
            onAddClient={() => setViewMode('add_client')} setClients={setClients} setStartTime={setStartTime} setDurationHours={setDurationHours} clients={clients} durationHours={durationHours} startTime={startTime}
            setClientsAndTickets={setClientsAndTickets}
            onChangeInstructor={() => setViewMode('change_instructor')} instructor={instructor}
            onCancel={props.onCancel}
            switchToClientTicketEditMode={index => {
                setClientTicketsIndexToEdit(index)
                setViewMode('client_ticket_manage')
            }}
            onRequestChange={() => request_update()}
        />
    }

    if (viewMode === 'add_client') {
        return <AddClientView onCancel={() => setViewMode('base')} onDone={d => {
            const newclients = [...clients]
            newclients.push(d)

            setClients(newclients)
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
                _clientsAndTickets[clientTicketsIndexToEdit].tickets = ticket_id_arr

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