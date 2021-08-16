import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Grid, Table, TableRow, TableCell, Button, CircularProgress, Select, MenuItem } from '@material-ui/core'

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";


import { ACTIVITY_TYPES, GROUPING_TYPES } from '../common/consts'

import client from '../apolloclient'
import { useQuery } from '@apollo/client'

import { FETCH_AVAILABLE_CREATE_LESSON_TYPES } from '../common/gql_defs'

function Index({ history }) {

    const [lessonType, setLessonType] = useState('')
    const [startTime, setStartTime] = useState(null)
    const [duration, setDuration] = useState(1)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)

    const { loading, data, error } = useQuery(FETCH_AVAILABLE_CREATE_LESSON_TYPES, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))

        }
    })


    return (
        <div className="fwh flex flex-col">
            <span className='flex flex-row jc ac' style={{ width: '100%', padding: '1rem' }}>수업생성</span>

            <Table>
                <TableRow>
                    <TableCell>
                        수업종류
                    </TableCell>
                    <TableCell>

                        {(() => {
                            if (loading) return <CircularProgress />

                            if (error || data?.fetch_available_create_lesson_types?.success === false) return <span>에러</span>

                            return <Select value={lessonType} onChange={e => setLessonType(e.target.value)}>
                                {data?.fetch_available_create_lesson_types?.lesson_types?.map(d => <MenuItem value={d}>{d}</MenuItem>)}
                            </Select>
                        })()}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>액티비티 종류</TableCell>
                    <TableCell>

                        <Select value={activityType} onChange={e => setActivityType(e.target.value)}>
                            {ACTIVITY_TYPES.map(d => <MenuItem value={d}>{d}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>그룹 종류</TableCell>
                    <TableCell>

                        <Select value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                            {GROUPING_TYPES.map(d => <MenuItem value={d}>{d}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>


                <TableRow>
                    <TableCell>수업시간</TableCell>
                    <TableCell>


                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                            <DatePicker
                                autoOk
                                value={startTime}
                                emptyLabel='날짜를 선택해주세요'
                                onChange={e => setStartTime(e)}
                                variant='dialog'
                                style={{ width: '5rem' }}

                            />
                        </MuiPickersUtilsProvider>


                        <span>길이</span>
                        <Select value={duration} onChange={e => {
                            console.log(e)
                            setDuration(e.target.value)
                        }}>
                            {[1, 2, 3, 4, 5, 6].map(a => <MenuItem value={a}>{a}시간</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row jc ac gap' style={{ padding: '1rem' }}>
                <Button variant='outlined' onClick={() => {
                    history.goBack()
                }} >취소</Button>
                <Button variant='outlined' >생성</Button>
            </div>

        </div>
    )
}

export default withRouter(Index)
