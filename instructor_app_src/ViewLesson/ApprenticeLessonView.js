import React, { useState } from 'react'
import { Chip, CircularProgress, Table, TableRow, TableCell, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { useQuery, useMutation } from '@apollo/client'
import { withRouter } from 'react-router-dom'
import { DELETE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP, FETCH_APPRENTICE_LESSON_INFO } from '../common/gql_defs'
import { DateTime } from 'luxon'

import { activity_type_to_kor_str, grouping_type_to_kor_str } from '../common/consts'

function ApprenticeLessonView({ history, match }) {

    console.log('apprentice lesson view')

    console.log(match)

    const { loading, data: fetchedData, error } = useQuery(FETCH_APPRENTICE_LESSON_INFO, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: parseInt(match.params.id)
        },
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const [requestDelete, { loading: del_loading, error: del_error }] = useMutation(DELETE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.delete_apprentice_lesson_from_instructor_app.success === true) {
                history.goBack()
            }
            else {
                alert('삭제 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('삭제 에러')
        }
    })


    const submit_button_disable_handler = () => {
        if (del_loading) return true

        return false
    }


    if (loading) {
        return <div className='fwh flex flex-row jc ac'>
            <CircularProgress />

        </div>
    }


    if (error || fetchedData?.fetch_apprentice_lesson_info?.success === false || fetchedData == null) {
        return <div className='fwh flex flex-row jc ac'>
            <span>에러</span>
        </div>
    }

    const data = fetchedData?.fetch_apprentice_lesson_info?.lesson

    if (data == null) {
        return null
    }

    return (
        <div className="fwh flex-col" style={{ maxHeight: '100%' }}>
            <div className='flex flex-row ac jc vmargin-0.5rem'>
                <span>견습강사 주도수업</span>
            </div>
            <div>
                <Table>
                    <TableRow>
                        <TableCell>강사</TableCell>
                        <TableCell>{data.apprentice_instructor_name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수업종류</TableCell>
                        <TableCell>{`${activity_type_to_kor_str(data.activity_type)}/${grouping_type_to_kor_str(data.grouping_type)}`}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수업일시</TableCell>
                        <TableCell>{DateTime.fromMillis(parseInt(data.starttime)).setZone('utc+9').toFormat('y-LL-dd HH:mm')} - {DateTime.fromMillis(parseInt(data.endtime)).setZone('utc+9').toFormat('HH:mm')}</TableCell>
                    </TableRow>
                </Table>
            </div>
            <div className="flex flex-row jc ac gap" style={{ paddingTop: '1rem' }}>
                <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
                <Button variant='outlined' onClick={() => history.push(`/lesson/apprenticelesson/edit/${match.params.id}`)}>수정</Button>
                <Button variant='outlined' disabled={submit_button_disable_handler()} onClick={() => {

                    let ret
                    ret = confirm('삭제하시겠습니까?')

                    if (ret) {

                        requestDelete({
                            variables: {
                                lessonid: parseInt(match.params.id)
                            }
                        })
                    }
                }}>삭제</Button>
            </div>

        </div>
    )
}

export default withRouter(ApprenticeLessonView)
