import React, { useState } from 'react'
import client from '../apolloclient'
import { useQuery, useMutation } from '@apollo/client'
import { Grid, CircularProgress, Table, TableRow, TableCell, Button, TextField, Select, MenuItem } from '@material-ui/core'
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import { QUERY_LESSON_DETAIL_WITH_LESSONID } from '../common/gql_defs'

import { DateTime } from 'luxon'

import { withRouter } from 'react-router-dom'

function EditNormalLesson({ history, match }) {

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [startTime, setStartTime] = useState(null)
    const [duration, setDuration] = useState(null)

    const { loading, error } = useQuery(QUERY_LESSON_DETAIL_WITH_LESSONID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: parseInt(match.params.id)
        },
        onCompleted: d => {
            console.log(d)

            if (d.query_lesson_detail_with_lessonid.success === false) {
                return alert('데이터 조회 실패')
            }

            const data = d.query_lesson_detail_with_lessonid.detail

            setActivityType(data.activity_type)
            setGroupingType(data.grouping_type)

            const st = DateTime.fromMillis(parseInt(data.starttime)).setZone('utc+9')
            const et = DateTime.fromMillis(parseInt(data.endtime)).setZone('utc+9')

            const _duration = et.diff(st, 'hours').hours
            console.log('duration')
            console.log(_duration)

            setDuration(_duration)
            setStartTime(st.toJSDate())


        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    if (loading) {
        return <div className='fwh flex jc ac'>
            <CircularProgress />
        </div>
    }

    if (error) {
        return <div className='fwh flex jc ac'>
            <span>에러</span>
        </div>

    }

    return (
        <div className='fwh flex flex-col'>
            <div className='flex flex-row jc ac vmargin-0.5rem'>

                <span style={{ wordBreak: 'keep-all' }}>일반수업 수정</span>
            </div>

            <Table>
                <TableRow>
                    <TableCell style={{ wordBreak: 'keep-all' }}>액티비티 종류</TableCell>
                    <TableCell>
                        <Select value={activityType} onChange={e => setActivityType(e.target.value)}>
                            <MenuItem value='PILATES'>필라테스</MenuItem>
                            <MenuItem value='GYROTONIC'>자이로토닉</MenuItem>
                            <MenuItem value='BALLET'>발레</MenuItem>
                            <MenuItem value='GYROKINESIS'>자이로키네시스</MenuItem>
                        </Select>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>그룹 종류</TableCell>
                    <TableCell>
                        <Select value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                            <MenuItem value='INDIVIDUAL'>개별</MenuItem>
                            <MenuItem value='SEMI'>세미</MenuItem>
                            <MenuItem value='GROUP'>그룹</MenuItem>
                        </Select>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>수업일시</TableCell>
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
                                <Select value={duration} onChange={e => setDuration(e.target.value)}>
                                    {[1, 2, 3, 4, 5, 6].map(a => <MenuItem value={a}>{a}시간</MenuItem>)}
                                </Select>
                            </Grid>
                        </Grid>
                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row ac jc gap' style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
                <Button variant='outlined'>변경</Button>
            </div>

        </div>
    )
}

export default withRouter(EditNormalLesson)
