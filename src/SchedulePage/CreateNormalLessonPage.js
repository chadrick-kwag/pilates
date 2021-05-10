
import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableHead, TableCell, Select, MenuItem, Button, CircularProgress } from '@material-ui/core'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import ErrorIcon from '@material-ui/icons/Error';
import ApprenticeInstructorSearchComponent from '../components/ApprenticeInstructorSearchComponent'

import { FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE, CREATE_APPRENTICE_LESSON } from '../common/gql_defs'
import client from '../apolloclient'
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'



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
    const [lessonDurationHours, setLessonDurationHours] = useState(null)
    const [clientTickets, setClientTickets] = useState({})

    const availLessonDurationHours = [1, 2, 3, 4, 5, 6, 7]


    const request_create = () => {

        console.log('request_create')
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
                            <ApprenticeInstructorSearchComponent onSelect={d => setSelectedAppInst(d)} />
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

        </>
    )
}