import React, { useState } from 'react'
import client from '../apolloclient'
import { useQuery, useMutation } from '@apollo/client'
import { Grid, CircularProgress, Table, TableRow, TableCell, Button, TextField, Select, MenuItem } from '@material-ui/core'
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import { UPDATE_APPRENTICE_LESSON_START_TIME_FROM_INSTRUCTOR_APP, FETCH_APPRENTICE_LESSON_INFO } from '../common/gql_defs'

import { DateTime } from 'luxon'

import { withRouter } from 'react-router-dom'
import { grouping_type_to_kor_str, activity_type_to_kor_str } from '../common/consts';
import WarningIcon from '@material-ui/icons/Warning'

function EditApprenticeLesson({ history, match }) {

    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [startTime, setStartTime] = useState(null)
    const [duration, setDuration] = useState(null)
    const [ticketIds, setTicketIds] = useState([])


    const [updateInfo, { loading: update_loading, error: update_error }] = useMutation(UPDATE_APPRENTICE_LESSON_START_TIME_FROM_INSTRUCTOR_APP, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.update_apprentice_lesson_start_time_from_instructor_app.success === false) {
                alert('변경 실패')
            }
            else {
                history.goBack()
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const { loading, error } = useQuery(FETCH_APPRENTICE_LESSON_INFO, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: parseInt(match.params.id)
        },
        onCompleted: d => {
            console.log(d)

            if (d.fetch_apprentice_lesson_info.success === false) {
                return alert('데이터 조회 실패')
            }

            const data = d.fetch_apprentice_lesson_info.lesson

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

    const handle_submit_button_disabled = () => {
        if (update_loading) return true

        return false
    }


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

            <div className='flex flex-row jc ac vmargin-0.5rem' style={{color: 'red'}}>
                <WarningIcon/>
                <span style={{ color: 'red' }}>수업 시작시간만 변경 가능합니다</span>
            </div>

            <Table>
                <TableRow>
                    <TableCell style={{ wordBreak: 'keep-all' }}>액티비티 종류</TableCell>
                    <TableCell>
                        {activity_type_to_kor_str(activityType)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>그룹 종류</TableCell>
                    <TableCell>
                        {grouping_type_to_kor_str(groupingType)}
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
                                <span>길이: {duration}시간</span>
                                
                            </Grid>
                        </Grid>
                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row ac jc gap' style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
                <Button variant='outlined' disabled={handle_submit_button_disabled()} onClick={() => {
                    updateInfo({
                        variables: {
                            lessonid: parseInt(match.params.id),
                            start_time: startTime.toUTCString(),
                        }
                    })
                }}>변경</Button>
            </div>

        </div>
    )
}

export default withRouter(EditApprenticeLesson)
