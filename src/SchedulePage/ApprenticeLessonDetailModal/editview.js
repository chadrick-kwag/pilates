import React, { useState } from 'react'
import { List, ListItem, Table, TableRow, TableCell, DialogContent, Button, DialogActions, CircularProgress, Chip, Select, MenuItem, Grid } from '@material-ui/core'
import client from '../../apolloclient'
import { FETCH_APPRENTICE_LESSON_BY_LESSONID, FETCH_TICKET_AVAIL_PLAN_AND_TICKETID_ARR_OF_APPRENTICE_INSTRUCTOR_AND_LESSON_TYPE, UPDATE_APPRENTICE_LESSON_OVERALL } from '../../common/gql_defs'
import PT from 'prop-types'
import { DateTime } from 'luxon'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";
import TicketManageModal from './ticketmanage'

import DeleteIcon from '@material-ui/icons/Delete';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'

const duration_options = [1, 2, 3, 4, 5, 6, 7]

function EditView({ lessonid, onCancel, onSuccess }) {


    const [instructor, setInstructor] = useState(null)
    const [startTime, setStartTime] = useState(null)
    const [duration, setDuration] = useState(null)
    const [ticketIdArr, setTicketIdArr] = useState(null)
    const [selectTicketModal, setSelectTicketModal] = useState(null)

    const [updateLesson, { loading, data, error }] = useMutation(UPDATE_APPRENTICE_LESSON_OVERALL, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.update_apprentice_lesson_overall.success) {
                onSuccess?.()
            }
        },
        onError: e => console.log(JSON.stringify(e))
    })


    const [fetchAvailablePlanTickets, { loading: ticket_loading, data: fetchedPlanTicketData, error: ticket_error }] = useLazyQuery(FETCH_TICKET_AVAIL_PLAN_AND_TICKETID_ARR_OF_APPRENTICE_INSTRUCTOR_AND_LESSON_TYPE, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log('fetched plan ticket data')
            console.log(d)

        },
        onError: e => console.log(JSON.stringify(e))
    })



    const { loading: initloading, data: initData, error: initErr } = useQuery(FETCH_APPRENTICE_LESSON_BY_LESSONID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid
        },
        onCompleted: d => {
            console.log(d)

            if (d?.fetch_apprentice_lesson_by_lessonid?.success === true) {


                setInstructor({
                    id: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.apprentice_instructor_id,
                    name: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.apprentice_instructor_name,
                    phonenumber: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.apprentice_instructor_phonenumber
                })

                fetchAvailablePlanTickets({
                    variables: {
                        apprentice_instructor_id: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.apprentice_instructor_id,
                        activity_type: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.activity_type,
                        grouping_type: d?.fetch_apprentice_lesson_by_lessonid?.lesson?.grouping_type
                    }
                })



                const endtime = DateTime.fromMillis(parseInt(d?.fetch_apprentice_lesson_by_lessonid?.lesson?.endtime)).setZone('utc+9')
                const starttime = DateTime.fromMillis(parseInt(d?.fetch_apprentice_lesson_by_lessonid?.lesson?.starttime)).setZone('utc+9')

                const _duration = endtime.diff(starttime, 'hours').hours

                console.log(starttime)
                console.log(_duration)

                setStartTime(starttime)
                setDuration(_duration)
                setTicketIdArr(d?.fetch_apprentice_lesson_by_lessonid?.lesson?.ticket_id_arr)
            }
        }
    })


    if (initloading) {
        return <DialogContent>
            <CircularProgress />
        </DialogContent>
    }

    if (initErr || initData?.fetch_apprentice_lesson_by_lessonid?.success === false) {
        return <DialogContent>
            <span>에러</span>
        </DialogContent>
    }


    return <>
        <DialogContent>
            <Table>
                <TableRow>
                    <TableCell>
                        강사
                    </TableCell>
                    <TableCell>
                        {`${instructor?.name}(${instructor?.phonenumber})`}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        티켓
                    </TableCell>
                    <TableCell>
                        {(() => {

                            const _children = []

                            if (ticketIdArr?.length > duration) {
                                _children.push(<ListItem style={{ backgroundColor: 'red' }}>티켓을 삭제해주세요</ListItem>)
                            }

                            ticketIdArr?.forEach(d => _children.push(<ListItem>
                                <div>{d}<DeleteIcon onClick={() => {
                                    setTicketIdArr(ticketIdArr.filter(x => x !== d))
                                }} /></div>
                            </ListItem>))

                            if (ticketIdArr?.length < (duration ?? 0)) {
                                _children.push(<ListItem onClick={() => {
                                    setSelectTicketModal(<TicketManageModal current_ticket_id_arr={ticketIdArr}
                                        planAndTickets={fetchedPlanTicketData?.fetch_ticket_avail_plan_and_ticketid_arr_of_apprentice_instructor_and_lesson_type?.plan_and_tickets} onCancel={() => setSelectTicketModal(null)}
                                        onTicketSelected={d => {
                                            setTicketIdArr([...ticketIdArr, d])
                                            setSelectTicketModal(null)
                                        }}
                                    />)
                                }}>
                                    추가
                                </ListItem>)
                            }

                            return <List>
                                {_children}
                            </List>
                        })()}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        시간
                    </TableCell>
                    <TableCell>
                        <Grid container style={{ alignItems: 'center' }}>
                            <Grid item xs={12} sm={6} md={2}>
                                <span>일시</span>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                    <DateTimePicker
                                        variant="inline"
                                        autoOk
                                        value={startTime?.toJSDate()}
                                        onChange={e => {
                                            setStartTime(DateTime.fromJSDate(e))
                                        }}
                                        minutesStep={15}
                                        ampm={false}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <span>길이</span>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Select value={duration} onChange={e => setDuration(e.target.value)}>
                                    {duration_options.map(a => <MenuItem value={a}>{`${a}시간`}</MenuItem>)}
                                </Select>
                            </Grid>
                        </Grid>
                    </TableCell>
                </TableRow>
            </Table>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => onCancel?.()}>취소</Button>
            <Button variant='outlined' onClick={() => {
                console.log(startTime)
                updateLesson({
                    variables: {
                        lessonid,
                        starttime: startTime.toHTTP(),
                        duration: duration,
                        ticket_id_arr: ticketIdArr
                    }
                })
            }}>완료</Button>
        </DialogActions>
        {selectTicketModal}
    </>
}

EditView.propTypes = {
    lessonid: PT.number.isRequired,
    onCancel: PT.func.isRequired,
    onSuccess: PT.func.isRequired
}

export default EditView