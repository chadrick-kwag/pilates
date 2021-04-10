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


export default function CreateApprenticeLesson(props) {

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [selectedAppInst, setSelectedAppInst] = useState(null)
    const [planArr, setPlanArr] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [lessonStartTime, setLessonStartTime] = useState(get_init_lesson_start_date())
    const [lessonDurationHours, setLessonDurationHours] = useState(null)


    const availLessonDurationHours = [1, 2, 3, 4, 5, 6, 7]


    const request_create = () => {
        // check input
        if (lessonStartTime === null || selectedAppInst === null || lessonDurationHours === null || activityType === null || groupingType === null || lessonDurationHours === null) {
            alert('invalid input')
            return;
        }

        const _var = {
            apprentice_instructor_id: selectedAppInst.id,
            starttime: lessonStartTime.toUTCString(),
            hours: lessonDurationHours,
            activity_type: activityType,
            grouping_type: groupingType,
            plan_id: selectedPlan.id
        }

        client.mutate({
            mutation: CREATE_APPRENTICE_LESSON,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.create_apprentice_lesson.success) {
                props.onSuccess?.()
            }
            else {
                const msg = res.data.create_apprentice_lesson.msg
                alert(`create lesson failed. msg: ${msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('create lesson error')
        })

    }

    const fetch_plans = () => {

        console.log('fetch plans')


        // check input
        if (activityType === null || groupingType === null || selectedAppInst === null) {
            alert('input invalid')
            return;
        }

        const _var = {
            apprentice_instructor_id: selectedAppInst.id,
            activity_type: activityType,
            grouping_type: groupingType
        }

        console.log(_var)

        client.query({
            query: FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_apprentice_plans_of_apprentice_instructor_and_agtype.success) {
                const arr = res.data.fetch_apprentice_plans_of_apprentice_instructor_and_agtype.plans
                setPlanArr(arr)
            }
            else {
                const msg = res.data.fetch_apprentice_plans_of_apprentice_instructor_and_agtype.msg
                alert(`fetch plans failed. msg: ${msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch plans error')
        })
    }


    useEffect(() => {
        // trigger plan fetch when three value is all not null and changed
        if (activityType === null || groupingType === null || selectedAppInst === null) {
            return;
        }

        fetch_plans()


    }, [activityType, groupingType, selectedAppInst])

    console.log('plan arr')
    console.log(planArr)

    return (
        <div>
            <div>
                <Table>
                    <TableRow>
                        <TableCell>
                            액티비티
                    </TableCell>
                        <TableCell>
                            <Select value={activityType} onChange={e => setActivityType(e.target.value)} >
                                <MenuItem value={'PILATES'}>필라테스</MenuItem>
                                <MenuItem value={'GYROTONIC'}>자이로토닉</MenuItem>
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
                            견습강사 선택
                        </TableCell>
                        <TableCell>
                            <ApprenticeInstructorSearchComponent onSelect={d => setSelectedAppInst(d)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            플랜선택
                        </TableCell>
                        <TableCell>
                            {(() => {
                                // if no appinst selected, disable
                                if (selectedAppInst === null || activityType === null || groupingType === null) {
                                    return <span>강사,수업종류를 먼저 선택해주세요</span>
                                }

                                if (planArr === null) {
                                    return <CircularProgress />
                                }
                                else if (planArr.length === 0) {
                                    return <div><ErrorIcon /><span>플랜 없음</span></div>
                                }
                                else {
                                    return <Select value={selectedPlan === null ? null : selectedPlan.id} onChange={e => {
                                        // find plan with id
                                        for (let j = 0; j < planArr.length; j++) {
                                            if (planArr[j].id === e.target.value) {
                                                setSelectedPlan(planArr[j])
                                                break
                                            }
                                        }

                                    }}>
                                        {(() => {

                                            const filtered_plan_arr = planArr.filter(d => {
                                                if (d.remainrounds > 0) {
                                                    return true
                                                }
                                                return false
                                            })



                                            if (filtered_plan_arr.length === 0) {
                                                const retarr = new Array()
                                                retarr.push(<MenuItem>no results</MenuItem>)
                                                return retarr
                                            }
                                            else {
                                                return filtered_plan_arr.map((d, i) => <MenuItem value={d.id}>남은횟수:{d.remainrounds}(플랜생성일:{DateTime.fromMillis(parseInt(d.created)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')})</MenuItem>)
                                            }

                                        })().map(d => d)}
                                    </Select>
                                }
                            })()}
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


        </div>
    )
}