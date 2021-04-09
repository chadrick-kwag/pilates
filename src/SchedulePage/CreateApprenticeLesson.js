import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableHead, TableCell, Select, MenuItem, Button, CircularProgress } from '@material-ui/core'
import { DateTimePicker } from "@material-ui/pickers";
import ErrorIcon from '@material-ui/icons/Error';
import ApprenticeInstructorSearchComponent from '../components/ApprenticeInstructorSearchComponent'

import { FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR_AND_AGTYPE } from '../common/gql_defs'
import client from '../apolloclient'


export default function CreateApprenticeLesson(props) {

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [selectedAppInst, setSelectedAppInst] = useState(null)
    const [planArr, setPlanArr] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [lessonStartTime, setLessonStartTime] = useState(new Date())
    const [lessonDurationHours, setLessonDurationHours] = useState(null)


    const availLessonDurationHours = [1, 2, 3, 4, 5, 6, 7]


    const request_create = () => {


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
                alert('fetch plans failed')
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
                                if (selectedAppInst === null) {
                                    return <span>견습강사 선택해주세요</span>
                                }

                                if (planArr === null) {
                                    return <CircularProgress />
                                }
                                else if (planArr.length === 0) {
                                    return <div><ErrorIcon /><span>플랜 없음</span></div>
                                }
                                else {
                                    return <Select value={selectedPlan === null ? null : selectedPlan.id} onChange={e => {
                                        console.log(e)
                                        console.log(e.target.value)
                                        // find plan with id
                                        for (let j = 0; j < planArr.length; j++) {
                                            if (planArr[j].id === e.target.value) {
                                                setSelectedPlan(planArr[j])
                                                break
                                            }
                                        }

                                    }}>
                                        {planArr.map((d, i) => <MenuItem value={d.id}>{d.rounds}</MenuItem>)}
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
                                    <DateTimePicker
                                        variant="inline"

                                        value={lessonStartTime}
                                        onChange={e => {
                                            setLessonStartTime(e)
                                        }}
                                        minutesStep={15}
                                    />
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
            <div>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전</Button>
                <Button variant='outlined' onClick={e => request_create()}>생성</Button>
            </div>


        </div>
    )
}