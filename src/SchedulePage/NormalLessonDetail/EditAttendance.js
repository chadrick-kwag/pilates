import React, { useState, useEffect } from 'react'
import { CircularProgress, DialogContent, DialogActions, Button, Table, TableRow, TableCell } from '@material-ui/core'
import PropTypes from 'prop-types'
import client from '../../apolloclient'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client'

import { REMOVE_NORMAL_LESSON_ATTENDANCE, QUERY_ATTENDANCE_INFO_OF_LESSONID, CREATE_NORMAL_LESSON_ATTENDANCE } from '../../common/gql_defs'


function EditAttendance({ onSuccess, onCancel, lessonid }) {


    const [fetchData, { loading, data, error }] = useLazyQuery(QUERY_ATTENDANCE_INFO_OF_LESSONID, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    const [doCheckin, { loading: checkin_loading, data: checkin_resp, error: checkin_err }] = useMutation(CREATE_NORMAL_LESSON_ATTENDANCE, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.create_normal_lesson_attendance?.success === false) {
                return alert('체크인 에러')
            }

            if (d?.create_normal_lesson_attendance?.success) {
                fetchData({
                    variables: {
                        lessonid: lessonid
                    }
                })
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('체크인 에러')
        }
    })


    const [removeCheckin, { loading: remove_checkin_loading }] = useMutation(REMOVE_NORMAL_LESSON_ATTENDANCE, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            fetchData({
                variables: {
                    lessonid: lessonid
                }
            })
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    useEffect(() => {
        fetchData({
            variables: {
                lessonid: lessonid
            }
        })
    }, [])


    if (loading) {
        return <DialogContent>
            <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                <CircularProgress />
            </div>
        </DialogContent>
    }

    return <>
        <DialogContent>

            {(() => {



                if (error || data?.query_attendance_info_of_lessonid?.success === false) {
                    return <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span>에러</span>
                    </div>

                }

                // show data

                return <Table>
                    <TableRow>
                        <TableCell>
                            회원
                        </TableCell>
                        <TableCell>
                        </TableCell>
                    </TableRow>
                    {data?.query_attendance_info_of_lessonid?.attendance_info?.map(a => <TableRow>
                        <TableCell>
                            {a.clientname}({a.clientphonenumber})
                        </TableCell>
                        <TableCell>
                            {a.checkin_time === undefined || a.checkin_time === null ? <Button variant='outlined' onClick={() => doCheckin({
                                variables: {
                                    lessonid: lessonid,
                                    clientid: a.clientid
                                }
                            })}>{checkin_loading ? <CircularProgress size="20" /> : '출석처리'}</Button> : <Button variant='outlined' onClick={() => removeCheckin({
                                variables: {
                                    lessonid: lessonid,
                                    clientid: a.clientid
                                }
                            })}>{remove_checkin_loading ? <CircularProgress size="20" /> : '미출석처리'}</Button>}
                        </TableCell>
                    </TableRow>)}
                </Table>


            })()}

        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => onCancel()}>이전</Button>
            <Button variant='outlined'>완료</Button>
        </DialogActions>
    </>
}


EditAttendance.propTypes = {
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    lessonid: PropTypes.number
}

export default EditAttendance