
import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableHead, TableCell, Select, MenuItem, Button, CircularProgress, Chip } from '@material-ui/core'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";


import client from '../../apolloclient'
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";

import InstructorSearchComponent from '../../components/InstructorSearchComponent4'

import ClientTicketChip from '../NormalLessonDetailEditView/ClientTicketChip'

import AddClientDialog from './AddClientDialog'
import SelectPlanAndTicketDialog from './SelectPlanAndTicketsDialog'

import { CREATE_LESSON_GQL } from '../../common/gql_defs'
import { withRouter } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client';


const get_init_lesson_start_date = () => {
    const d = new Date()

    d.setHours(d.getHours() + 1)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)

    return d
}


function CreateNormalLessonPage(props) {



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

    const [requestCreate, { loading, request_create_response, error }] = useMutation(CREATE_LESSON_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            if (d.create_lesson.success) {
                props.history.push('/schedule')
                return
            }

            alert('생성 실패')
        },
        onError: e => {
            console.log(e)
            alert('생성 에러')
        }
    })


    const request_create = () => {

        // check inputs

        if (selectedInst === null) {
            alert('강사를 선택해주세요')
            return
        }

        if (lessonDurationHours === null) {
            alert('수업 길이를 선택해주세요')
            return
        }

        if (activityType === null) {
            alert('액티비티 종류를 선택해주세요')
            return
        }

        if (groupingType === null) {
            alert('수업 인원종류를 선택해주세요')
            return
        }

        if (clientTickets.length === 0) {
            alert('수강할 회원들을 선택해주세요')
            return
        }

        // check for each clients, # of tickets match duration, and ticket ids are all unique, and all clients are unique
        const ticket_id_set = new Set()
        const client_id_set = new Set()

        for (let i = 0; i < clientTickets.length; i++) {
            const cid = clientTickets[i].id
            // check cid is unique
            if (client_id_set.has(cid)) {
                alert('회원을 중복해서 선택할 수 없습니다.')
                return
            }

            client_id_set.add(cid)

            // check ticket length
            const ticket_arr = clientTickets[i].tickets

            if (ticket_arr.length !== lessonDurationHours) {
                alert('일부 회원의 티켓 수가 수업 길이와 맞지 않습니다.')
                return
            }

            for (let j = 0; j < ticket_arr.length; j++) {
                const tid = ticket_arr[j]

                if (ticket_id_set.has(tid)) {
                    alert('중복되서 사용되는 티켓이 있습니다.')
                    return
                }

                ticket_id_set.add(tid)
            }

        }



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

        requestCreate({
            variables: _var
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
                                {clientTickets.map((d, i) => {
                                    let is_error = false

                                    if (groupingType === 'INDIVIDUAL') {
                                        if (i > 0) {
                                            is_error = true
                                        }
                                    }
                                    else if (groupingType === 'SEMI') {
                                        if (i > 1) {
                                            is_error = true
                                        }
                                    }

                                    return <ClientTicketChip isError={is_error} name={d.name} phonenumber={d.phonenumber} tickets={d.tickets} slotTotal={lessonDurationHours}
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
                                    />
                                })}

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
                <Button variant='outlined' color='secondary' onClick={e => props.history.goBack()}>이전</Button>
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


export default withRouter(CreateNormalLessonPage)