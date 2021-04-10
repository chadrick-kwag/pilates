import React, { useState } from 'react'
import { DateTime } from 'luxon'

import { Dialog, DialogTitle, DialogActions, DialogContent, Button, Table, TableRow, TableCell } from '@material-ui/core'
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";

import client from '../apolloclient'
import { CHANGE_APPRENTICE_LESSON_STARTTIME, CANCEL_APPRENTICE_LESSON } from '../common/gql_defs'

import { grouping_type_to_kor, activity_type_to_kor } from '../common/consts'

export default function ApprenticeLessonDetailModal(props) {


    const [editMode, setEditMode] = useState(false)
    const [editLessonStartTime, setEditLessonStartTime] = useState(new Date(parseInt(props.lesson.starttime)))

    const format_lesson_time = () => {
        console.log(props)
        const start = DateTime.fromMillis(parseInt(props.lesson.starttime)).toFormat('y-LL-dd HH:mm')
        const end = DateTime.fromMillis(parseInt(props.lesson.endtime)).toFormat('HH:mm')

        return start + '~' + end
    }

    const get_lesson_duration_in_hours = () => {
        const start = DateTime.fromMillis(parseInt(props.lesson.starttime))
        const end = DateTime.fromMillis(parseInt(props.lesson.endtime))

        const duration = end - start
        const hours = Math.round(duration / (60 * 60 * 1000))
        console.log('get_lesson_duration_in_hours')
        console.log(duration)

        return hours
    }

    const request_edit = () => {

        // check input


        if (parseInt(props.lesson.starttime) === editLessonStartTime.getTime()) {
            alert('no change in start time')
            return;
        }

        // alert('request edit')

        const _var = {
            lessonid: props.lesson.indomain_id,
            starttime: editLessonStartTime.toUTCString()
        }

        client.mutate({
            mutation: CHANGE_APPRENTICE_LESSON_STARTTIME,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.change_apprentice_lesson_starttime.success) {

                console.log('editsuccess')
                props.onEditSuccess?.()
            }
            else {
                const msg = res.data.change_apprentice_lesson_starttime.msg
                alert(`edit lesson fail. msg: ${msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('edit lesson error')
        })


    }

    const request_cancel_lesson = () => {

        client.mutate({
            mutation: CANCEL_APPRENTICE_LESSON,
            variables: {
                lessonid: props.lesson.indomain_id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.cancel_apprentice_lesson.success) {
                props.onEditSuccess?.()
            }
            else {
                alert('cancel lesson fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('cancel lesson error')
        })
    }




    return (
        <Dialog open={true} onClose={e => props.onCancel?.()}>
            <DialogTitle>
                견습강사 수업
        </DialogTitle>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>
                            견습강사
                        </TableCell>
                        <TableCell>
                            <span>{props.lesson.instructorname}({props.lesson.instructorphonenumber})</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수업종류</TableCell>
                        <TableCell>{activity_type_to_kor[props.lesson.activity_type]}/{grouping_type_to_kor[props.lesson.grouping_type]}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            수업시간
                        </TableCell>
                        <TableCell>
                            {editMode ? <div className='row-gravity-left children-padding'>
                                <div className='row-gravity-center'>
                                    <span>시작시간</span>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                        <DateTimePicker
                                            variant="inline"

                                            value={editLessonStartTime}
                                            onChange={e => {
                                                setEditLessonStartTime(e)
                                            }}
                                            minutesStep={15}
                                            ampm={false}
                                        />
                                    </MuiPickersUtilsProvider>

                                </div>
                                <div className='row-gravity-center'>
                                    <span>수업길이:</span>
                                    <span>{get_lesson_duration_in_hours()}시간</span>

                                </div>

                            </div> : <span>{format_lesson_time()}</span>}

                        </TableCell>
                    </TableRow>
                </Table>
            </DialogContent>

            {editMode ? <DialogActions>

                <Button onClick={e => {
                    setEditLessonStartTime(new Date(parseInt(props.lesson.starttime)))
                    setEditMode(false)
                }}>변경취소</Button>
                <Button onClick={e => request_edit()}>변경</Button>
            </DialogActions> :
                <DialogActions>
                    <Button onClick={e => props.onCancel?.()}>이전</Button>
                    <Button onClick={e => setEditMode(true)}>변경</Button>
                    <Button onClick={e => request_cancel_lesson()}>삭제</Button>
                </DialogActions>
            }



        </Dialog>
    )
}