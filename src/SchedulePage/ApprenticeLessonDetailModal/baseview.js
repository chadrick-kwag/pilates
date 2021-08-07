import React from 'react'
import client from '../../apolloclient'
import { FETCH_APPRENTICE_LESSON_BY_LESSONID } from '../../common/gql_defs'
import { useQuery } from '@apollo/client'
import { CircularProgress, DialogActions, DialogTitle, DialogContent, Button, Table, TableRow, TableCell } from '@material-ui/core'
import { DateTime } from 'luxon'
import PT from 'prop-types'
import { grouping_type_to_kor, activity_type_to_kor } from '../../common/consts'

function BaseView({ lessonid, onEdit, onCancel }) {

    console.log('lessonid')
    console.log(lessonid)

    const { loading, data, error } = useQuery(FETCH_APPRENTICE_LESSON_BY_LESSONID, {
        client: client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: lessonid
        },
        onCompleted: d => console.log(d),
        onError: e => console.log(JSON.stringify(e))

    })

    if (loading) {
        return <CircularProgress />

    }

    if (error || data?.fetch_apprentice_lesson_by_lessonid?.success === false) {
        return <span>에러</span>
    }

    const lesson_data = data?.fetch_apprentice_lesson_by_lessonid?.lesson
    return <>
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
                        <span>{lesson_data.apprentice_instructor_name}({lesson_data.apprentice_instructor_phonenumber})</span>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>수업종류</TableCell>
                    <TableCell>{activity_type_to_kor[lesson_data.activity_type]}/{grouping_type_to_kor[lesson_data.grouping_type]}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        수업시간
                    </TableCell>
                    <TableCell>
                        <span>{DateTime.fromMillis(parseInt(lesson_data.starttime)).setZone('utc+9').toFormat('y-LL-dd HH:mm')} - {DateTime.fromMillis(parseInt(lesson_data.endtime)).setZone('utc+9').toFormat('HH:mm')}</span>

                    </TableCell>
                </TableRow>
            </Table>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => onCancel?.()}>이전</Button>
            <Button variant='outlined' onClick={() => onEdit?.()}>수정</Button>
        </DialogActions>
    </>
}

BaseView.propTypes = {
    lessonid: PT.number.isRequired,
    onCancel: PT.func,
    onEdit: PT.func
}

export default BaseView