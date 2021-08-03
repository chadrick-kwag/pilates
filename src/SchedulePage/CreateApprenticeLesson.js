import React, { useState, useEffect } from 'react'
import { Grid, Table, TableRow, TableHead, TableCell, Select, MenuItem, Button, CircularProgress } from '@material-ui/core'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import ErrorIcon from '@material-ui/icons/Error';
import ApprenticeInstructorSearchComponent from '../components/ApprenticeInstructorSearchComponent'

import { FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE, CREATE_APPRENTICE_LESSON } from '../common/gql_defs'
import client from '../apolloclient'
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'
import { withRouter } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client'


const get_init_lesson_start_date = () => {
    const d = new Date()

    d.setHours(d.getHours() + 1)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)

    return d
}


function CreateApprenticeLesson({ history }) {

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [selectedAppInst, setSelectedAppInst] = useState(null)
    const [planArr, setPlanArr] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [lessonStartTime, setLessonStartTime] = useState(get_init_lesson_start_date())
    const [lessonDurationHours, setLessonDurationHours] = useState(null)


    const [fetchPlans, { loading, data: fetchedPlans, error }] = useLazyQuery(FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE, {
        client: client,
        fetchPolicy: 'no-cache',

    })


    const [requestCreate, { loading: loading2, data: request_create_response, error: error2 }] = useMutation(CREATE_APPRENTICE_LESSON, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.create_apprentice_lesson.success) {
                history.push('/schedule')
            }
            else {
                alert('생성 실패')
            }
        },
        onError: e => {
            console.log(e)
            alert('생성 에러')
        }

    })


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

        requestCreate({
            variables: _var
        })



    }

    const fetch_plans = () => {


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


        fetchPlans({
            variables: _var
        })
    }


    useEffect(() => {
        // trigger plan fetch when three value is all not null and changed
        if (activityType === null || groupingType === null || selectedAppInst === null) {
            return;
        }

        fetch_plans()


    }, [activityType, groupingType, selectedAppInst])



    return (
        <div>
            <div>
                <Table>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
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
                        <TableCell style={{ wordBreak: 'keep-all' }}>
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
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            견습강사 선택
                        </TableCell>
                        <TableCell>
                            <ApprenticeInstructorSearchComponent onSelect={d => setSelectedAppInst(d)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            플랜선택
                        </TableCell>
                        <TableCell>
                            {(() => {
                                // if no appinst selected, disable

                                if (selectedAppInst === null || activityType === null || groupingType === null) {
                                    return <span>강사,수업종류를 먼저 선택해주세요</span>
                                }

                                if (loading) {
                                    return <CircularProgress />
                                }



                                //FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE

                                console.log('fetchedPlans')
                                console.log(fetchedPlans)

                                if (error || fetchedPlans?.fetch_apprentice_plans_of_apprentice_instructor_and_agtype?.success === false) {
                                    return <span><ErrorIcon />플랜 조회 실패</span>
                                }
                                const plans = fetchedPlans?.fetch_apprentice_plans_of_apprentice_instructor_and_agtype?.plans

                                if (plans === undefined) {
                                    return null
                                }

                                return <Select value={selectedPlan === null ? null : selectedPlan.id} onChange={e => {
                                    // find plan with id
                                    for (let j = 0; j < plans.length; j++) {
                                        if (plans[j].id === e.target.value) {
                                            setSelectedPlan(plans[j])
                                            break
                                        }
                                    }

                                }}
                                    label={selectedPlan === null ? '검색해주세요' : '선택되었습니다'}
                                >
                                    {(() => {

                                        const filtered_plan_arr = plans.filter(d => {
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
                            })()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            수업시간선택
                        </TableCell>
                        <TableCell>
                            <div className='row-gravity-left children-padding'>

                                <Grid container style={{ alignItems: 'center' }}>
                                    <Grid item xs={12} sm={6} md={3} style={{ padding: '0.5rem' }}>
                                        <span style={{ wordBreak: 'keep-all' }}>시작시간</span>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} style={{ padding: '0.5rem' }}>
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
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} style={{ padding: '0.5rem' }}>
                                        <span style={{ wordBreak: 'keep-all' }}>길이시간</span>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} style={{ padding: '0.5rem' }}>
                                        <Select value={lessonDurationHours} onChange={e => setLessonDurationHours(e.target.value)}>

                                            {availLessonDurationHours.map(d => <MenuItem value={d}>{d}</MenuItem>)}

                                        </Select>
                                    </Grid>
                                </Grid>

                            </div>

                        </TableCell>
                    </TableRow>
                </Table>
            </div>
            <div className="row-gravity-center children-padding">
                <Button variant='outlined' color='secondary' onClick={e => history.goBack()}>이전</Button>
                <Button variant='outlined' onClick={e => request_create()}>{loading2 ? <CircularProgress /> : '생성'}</Button>
            </div>


        </div>
    )
}


export default withRouter(CreateApprenticeLesson)