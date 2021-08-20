import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Grid, Table, TableRow, TableCell, Button, CircularProgress, Select, MenuItem } from '@material-ui/core'

import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";


import { ACTIVITY_TYPES, GROUPING_TYPES } from '../common/consts'

import client from '../apolloclient'
import { useMutation, useQuery } from '@apollo/client'

import {  CREATE_NORMAL_LESSON_FROM_INSTRUCTOR_APP } from '../common/gql_defs'
import { DateTime } from 'luxon'
import { activity_type_to_kor_str, grouping_type_to_kor_str } from '../common/consts'

function CreateNormalLesson({ history }) {
    const initdate = DateTime.now().setZone('utc+9').plus({ hours: 1 }).startOf('hour').toJSDate()

    const [startTime, setStartTime] = useState(initdate)
    const [duration, setDuration] = useState(1)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)


    const [createLesson, { loading: cl_loading, error: cl_error }] = useMutation(CREATE_NORMAL_LESSON_FROM_INSTRUCTOR_APP, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

            if (d.create_normal_lesson_from_instructor_app.success === false) {
                alert('생성 실패')
            }
            else {
                history.push('/')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    const is_submit_disabled = () => {
        if (activityType === null || groupingType === null || startTime === null ) return true

        if (duration < 1) {
            return true
        }


        return false
    }


    return (
        <div className="fwh flex flex-col">
            <span className='flex flex-row jc ac' style={{ width: '100%', marginTop: '0.5rem', marginBottom: '0.5rem', wordBreak: 'keep-all' }}>일반수업 생성</span>

            <Table>

                <TableRow>
                    <TableCell><span style={{ wordBreak: 'keep-all' }}>액티비티 종류</span></TableCell>
                    <TableCell>

                        <Select value={activityType} onChange={e => setActivityType(e.target.value)}>
                            {ACTIVITY_TYPES.map(d => <MenuItem value={d}>{activity_type_to_kor_str(d)}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell><span style={{ wordBreak: 'keep-all' }}>그룹 종류</span></TableCell>
                    <TableCell>

                        <Select value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                            {GROUPING_TYPES.map(d => <MenuItem value={d}>{grouping_type_to_kor_str(d)}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>


                <TableRow>
                    <TableCell><span style={{ wordBreak: 'keep-all' }}>수업시간</span></TableCell>
                    <TableCell>
                        <Grid container>
                            <Grid item xs={12} md={6}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                    <DateTimePicker
                                        autoOk
                                        value={startTime}
                                        emptyLabel='날짜를 선택해주세요'
                                        onChange={e => setStartTime(e)}
                                        variant='dialog'
                                        style={{ width: '5rem' }}
                                        ampm={false}
                                        minutesStep={15}
                                        style={{ widht: '10rem' }}

                                    />
                                </MuiPickersUtilsProvider>


                            </Grid>
                            <Grid item xs={12} md={6} className='flex flex-row ac'>
                                <span>길이</span>
                                <Select value={duration} onChange={e => {
                                    console.log(e)
                                    setDuration(e.target.value)
                                }}>
                                    {[1, 2, 3, 4, 5, 6].map(a => <MenuItem value={a}>{a}시간</MenuItem>)}
                                </Select>

                            </Grid>
                        </Grid>


                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row jc ac gap' style={{ padding: '1rem' }}>
                <Button variant='outlined' onClick={() => {
                    history.goBack()
                }} >취소</Button>
                <Button variant='outlined' disabled={is_submit_disabled()} onClick={() => {
                    const _var = {
                        activity_type: activityType,
                        grouping_type: groupingType,
                        start_time: DateTime.fromJSDate(startTime).setZone('utc+9').toHTTP(),
                        duration: duration
                    }

                    console.log(_var)

                    createLesson({
                        variables: _var
                    })
                }} >생성</Button>
            </div>

        </div>
    )
}

export default withRouter(CreateNormalLesson)
