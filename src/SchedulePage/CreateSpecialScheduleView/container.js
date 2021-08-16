import React, { useState } from 'react'

import { Table, TableRow, TableCell, Button, TextField, TextareaAutosize, Grid } from '@material-ui/core'

import koLocale from "date-fns/locale/ko";

import { CREATE_SPECIAL_SCHEDULE } from '../../common/gql_defs'
import client from '../../apolloclient'

import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { withRouter } from 'react-router-dom'

function Container({ history }) {

    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date())

    const [title, setTitle] = useState("")
    const [memo, setMemo] = useState("")


    const request_create = () => {
        client.mutate({
            mutation: CREATE_SPECIAL_SCHEDULE,
            variables: {
                starttime: startTime.toUTCString(),
                endtime: endTime.toUTCString(),
                title: title,
                memo: memo
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.create_special_schedule.success) {
                history.push('/schedule')
            }
            else {
                alert(`스케쥴 생성 실패(${res.data.create_special_schedule.msg})`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('스케쥴 생성 에러')
        })
    }


    const is_input_okay = () => {

        if (startTime === null) {
            console.log('starttime is null')
            return false
        }

        if (endTime === null) {
            console.log('end time is null')
            return false
        }

        if (startTime >= endTime) {
            console.log(startTime)
            console.log(endTime)
            console.log('starttime >= endtime')
            return false
        }

        if (title === "" || title === null) {
            console.log('title is null')
            return false
        }

        return true

    }

    return (
        <>
            <Grid container>
                <Grid item xs={12}>

                    <Table>
                        <TableRow>
                            <TableCell>
                                시작시간
                            </TableCell>
                            <TableCell>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                                    <DateTimePicker
                                        variant="inline"
                                        value={startTime}
                                        onChange={e => {
                                            setStartTime(e)
                                        }}
                                        minutesStep={15}
                                        ampm={false}
                                    />
                                </MuiPickersUtilsProvider>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                종료시간
                            </TableCell>
                            <TableCell>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                                    <DateTimePicker
                                        variant="inline"
                                        value={endTime}
                                        onChange={e => {
                                            setEndTime(e)
                                        }}
                                        minutesStep={15}
                                        ampm={false}
                                    />
                                </MuiPickersUtilsProvider>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                스케쥴 이름
                            </TableCell>
                            <TableCell>
                                <TextField value={title} onChange={e => setTitle(e.target.value)} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                메모
                            </TableCell>
                            <TableCell>
                                <TextareaAutosize value={memo} onChange={e => setMemo(e.target.value)} />
                            </TableCell>
                        </TableRow>
                    </Table>
                </Grid>

                <Grid item xs={12}>

                    <div className="row-gravity-center children-padding">
                        <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
                        <Button variant='outlined' disabled={!is_input_okay()} onClick={() => request_create()}>생성</Button>
                    </div>

                </Grid>

            </Grid>

        </>
    )
}

export default withRouter(Container)