import React, { useState } from 'react'
import { TextareaAutosize, TextField, Button, Table, TableRow, TableCell, DialogContent, DialogActions, CircularProgress } from '@material-ui/core'


import PropTypes from 'prop-types';



import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import client from '../../apolloclient'
import { CHANGE_SPECIAL_SCHEDULE_BY_ID } from '../../common/gql_defs'

function EditView({ onCancel, initData, id, onSuccess }) {

    const [title, setTitle] = useState(initData.title)
    const [memo, setMemo] = useState(initData.memo)

    const [startTime, setStartTime] = useState(initData.starttime)
    const [endTime, setEndTime] = useState(initData.endtime)


    const is_okay_to_request = () => {
        if (title === null) {
            return false
        }

        if(title.trim() === ""){
            return false
        }

        if (startTime === null || endTime === null) {
            return false
        }

        if (startTime >= endTime) {
            return false
        }

        if (id === undefined || id === null) {
            return false
        }

        return true
    }

    const request_edit = () => {


        const _var = {
            id: id,
            starttime: startTime.toUTCString(),
            endtime: endTime.toUTCString(),
            title: title,
            memo: memo
        }

        client.mutate({
            mutation: CHANGE_SPECIAL_SCHEDULE_BY_ID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.change_special_schedule.success) {
                onSuccess?.()
            }
            else {
                alert(`스케쥴 변경 실패(${res.data.change_special_schedule.msg})`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('스케쥴 변경 에러')
        })
    }

    return (
        <>
            <DialogContent>
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
                            스케쥴명
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
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel?.()}>취소</Button>
                <Button disabled={!is_okay_to_request()} onClick={() => request_edit()}>변경</Button>
            </DialogActions>
        </>
    )
}

EditView.propTypes = {
    onCancel: PropTypes.func,
    initData: PropTypes.object,
    id: PropTypes.number,
    onSuccess: PropTypes.func
}

export default EditView