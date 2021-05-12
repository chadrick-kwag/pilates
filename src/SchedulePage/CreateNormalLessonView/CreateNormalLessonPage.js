
import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableHead, TableCell, Select, MenuItem, Button, CircularProgress, Chip } from '@material-ui/core'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import ErrorIcon from '@material-ui/icons/Error';



import client from '../../apolloclient'
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'

import InstructorSearchComponent from '../../components/InstructorSearchComponent4'

import ClientTicketChip from '../NormalLessonDetailEditView/ClientTicketChip'

import AddClientDialog from './AddClientDialog'
import SelectPlanAndTicketDialog from './SelectPlanAndTicketsDialog'

import { CREATE_LESSON_GQL } from '../../common/gql_defs'


const get_init_lesson_start_date = () => {
    const d = new Date()

    d.setHours(d.getHours() + 1)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)

    return d
}


export default function CreateNormalLessonPage(props) {



    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [selectedInst, setSelectedInst] = useState(null)
    const [planArr, setPlanArr] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [lessonStartTime, setLessonStartTime] = useState(get_init_lesson_start_date())
    const [lessonDurationHours, setLessonDurationHours] = useState(1)
    const [clientTickets, setClientTickets] = useState([])

    const [showAddClientDialog, setShowAddClientDialog] = useState(false)

    const availLessonDurationHours = [1, 2, 3, 4, 5, 6, 7]

    const [showSelectPlanAndTicketDialog, setShowSelectPlanAndTicketDialog] = useState(false)
    const [selectPlanAndTicketDialogClientIndex, setSelectPlanAndTicketDialogClientIndex] = useState(null)




    const request_create = () => {

        console.log('request_create')


        let endtime_ms = lessonStartTime.getTime() + lessonDurationHours * 3600 * 1000
        let endtime = new Date()
        endtime.setTime(endtime_ms)

        // gather ticket ids
        let ticketid_arr = []
        for (let i = 0; i < clientTickets.length; i++) {
            ticketid_arr = ticketid_arr.concat(clientTickets[i].tickets)
        }

        const _var = {
            ticketids: ticketid_arr,
            instructorid: selectedInst.id,
            starttime: lessonStartTime.toUTCString(),
            endtime: endtime.toUTCString(),
            activity_type: activityType,
            grouping_type: groupingType

        }

        console.log(_var)

        client.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.create_lesson.success) {
                props.onSuccess?.()
            }
            else {
                alert(`create lesson failed. msg: ${res.data.create_lesson.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('create lesson error')
        })
    }

    return (
        <>

            <div style={{ width: '100%' }}>
                <Table>
                    <TableRow>
                        <TableCell>
                            액티비티
                </TableCell>
                        <TableCell>
                            <Select value={activityType} onChange={e => setActivityType(e.target.value)} >
                                <MenuItem value={'PILATES'}>필라테스</MenuItem>
                                <MenuItem value={'GYROTONIC'}>자이로토닉</MenuItem>
                                <MenuItem value={'BALLET'}>발레</MenuItem>
                                <MenuItem value={'GYROKINESIS'}>자이로키네시스</MenuItem>
                            </Select>
                        </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell>
                            그룹
                    </TableCell>
                        <TableCell>
                            <Select value={groupingType} onChange={e => setGroupingType(e.target.value)} >
                                <MenuItem value={'INDIVIDUAL'}>개별</MenuItem>
                                <MenuItem value={'SEMI'}>세미</MenuItem>
                                <MenuItem value={'GROUP'}>그룹</MenuItem>
                            </Select>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            강사 선택
                        </TableCell>
                        <TableCell>
                            <InstructorSearchComponent onInstructorSelected={p => setSelectedInst(p)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            회원선택
                        </TableCell>
                        <TableCell>
                            <div>
                                {clientTickets.map((d, i) => <ClientTicketChip name={d.name} phonenumber={d.phonenumber} tickets={d.tickets} slotTotal={lessonDurationHours}
                                    onDeleteClientTickets={() => {
                                        let newarr = [...clientTickets]
                                        newarr.splice(i, 1)
                                        setClientTickets(newarr)
                                    }}

                                    onEditClientTickets={() => {

                                        if (activityType === null || groupingType === null) {
                                            alert('액티비티/그룹 종류를 먼저 선택해주세요')
                                            return
                                        }
                                        setSelectPlanAndTicketDialogClientIndex(i)
                                        setShowSelectPlanAndTicketDialog(true)
                                    }}
                                />)}

                                {(() => {
                                    if (groupingType === 'INDIVIDUAL' && clientTickets.length > 0) {
                                        return null
                                    }
                                    if (groupingType === 'SEMI' && clientTickets.length > 1) {
                                        return null
                                    }
                                    return <Chip label='add' onClick={() => setShowAddClientDialog(true)} />
                                })()}
                            </div>

                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            수업시간선택
                        </TableCell>
                        <TableCell>
                            <div className='row-gravity-left children-padding'>
                                <div className="children-padding row-gravity-center">
                                    <span>시작시간</span>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                                        <DateTimePicker
                                            variant="inline"
                                            value={lessonStartTime}
                                            onChange={e => {
                                                setLessonStartTime(e)
                                            }}
                                            minutesStep={15}
                                            ampm={false}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>
                                <div className="children-padding row-gravity-center">
                                    <span>길이시간</span>
                                    <Select value={lessonDurationHours} onChange={e => setLessonDurationHours(e.target.value)}>

                                        {availLessonDurationHours.map(d => <MenuItem value={d}>{d}</MenuItem>)}

                                    </Select>
                                </div>
                            </div>

                        </TableCell>
                    </TableRow>
                </Table>
            </div>


            <div className="row-gravity-center children-padding">
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전</Button>
                <Button variant='outlined' onClick={e => request_create()}>생성</Button>
            </div>


            {showAddClientDialog ? <AddClientDialog onClose={() => setShowAddClientDialog(false)} onAddClient={a => {
                console.log(a)
                let new_ct = {
                    id: a.id,
                    name: a.clientname,
                    phonenumber: a.clientphonenumber,
                    tickets: []
                }

                const n = [...clientTickets]
                n.push(new_ct)

                setClientTickets(n)
                setShowAddClientDialog(false)
            }} /> : null}

            {showSelectPlanAndTicketDialog ? <SelectPlanAndTicketDialog tickets={clientTickets[selectPlanAndTicketDialogClientIndex].tickets} totalSlotSize={lessonDurationHours}
                activityType={activityType}
                groupingType={groupingType}
                clientid={clientTickets[selectPlanAndTicketDialogClientIndex].id}
                onDone={tia => {
                    let newarr = [...clientTickets]
                    newarr[selectPlanAndTicketDialogClientIndex].tickets = tia
                    setClientTickets(newarr)
                    setShowSelectPlanAndTicketDialog(false)
                }} onClose={() => setShowSelectPlanAndTicketDialog(false)} /> : null}
        </>
    )
}