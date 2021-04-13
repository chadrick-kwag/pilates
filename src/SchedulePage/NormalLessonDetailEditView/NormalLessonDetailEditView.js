import React, { useState } from 'react'

import { DateTime } from 'luxon'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import BaseView from './BaseView'
import AddClientView from './AddClientView'
import ChangeInstructorView from './ChangeInstructorView'


export default function NormalLessonDetailEditView(props) {


    const [instructor, setInstructor] = useState({
        name: props.data.instructorname,
        phonenumber: props.data.instructorphonenumber,
        id: props.data.instructorid
    })

    const [startTime, setStartTime] = useState(DateTime.fromMillis(parseInt(props.data.starttime)).setZone('UTC+9'))
    const [durationHours, setDurationHours] = useState((() => {
        const _st = DateTime.fromMillis(parseInt(props.data.starttime))
        const et = DateTime.fromMillis(parseInt(props.data.endtime))

        const duration = et.diff(_st)
        const hours = duration.as('hours')

        return hours
    })())
    const [clients, setClients] = useState(props.data.client_info_arr)

    const [viewMode, setViewMode] = useState('base')


    const request_edit_changes = () => {
        alert('request')

    }


    if (viewMode === 'base') {
        return <BaseView {...props} onAddClient={() => setViewMode('add_client')} setClients={setClients} setStartTime={setStartTime} setDurationHours={setDurationHours} clients={clients} durationHours={durationHours} startTime={startTime} onRequestChange={() => request_edit_changes()} 
        onChangeInstructor={()=>setViewMode('change_instructor')} instructor={instructor}
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

    if (viewMode === 'change_instructor') {
        return <ChangeInstructorView onCancel={() => setViewMode('base')} onDone={d => {
            setInstructor(d)
            setViewMode('base')
        }} />
    }

}