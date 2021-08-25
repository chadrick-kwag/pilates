import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Grid, Table, TableRow, TableCell, Button, CircularProgress, Select, MenuItem } from '@material-ui/core'

import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";


import { ACTIVITY_TYPES, GROUPING_TYPES , activity_type_to_kor_str, grouping_type_to_kor_str} from '../common/consts'

import client from '../apolloclient'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { CREATE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP, FETCH_AVAILABLE_APPRENTICE_PLANS } from '../common/gql_defs'
import { DateTime } from 'luxon'


const is_ticket_available = t=>{
    if(t.consumed_time !=null){
        return false
    }

    if(DateTime.fromISO(t.expire_time) <= DateTime.now()){
        return false
    }

    return true
}

const is_ticket_already_selected = (t,selected_ticket_ids) =>{
    if(selected_ticket_ids.includes(t.id)){
        return true
    }
    return false
}

const sort_func_avail_ticket_first_expire_time_closer_first = (a, b) => {

    if (a.consumed_time != null && b.consumed_time != null) {
        return 0
    }

    if (a.consumed_time != null) {
        return 1
    }

    if (b.consumed_time != null) {
        return -1
    }

    if (a.expire_time <= b.expire_time) {
        return -1
    }
    else {
        return 1
    }


}

const get_closest_expire_time_of_avail_ticket = (tickets) => {
    let output = null

    for (let a of tickets) {
        if (a.consumed_time !== null) {
            continue
        }

        if (output === null) {
            output = a.expire_time
        }
        else if (a.expire_time < output) {
            output = a.expire_time
        }
    }

    return output
}

function CreateApprenticeLesson({ history }) {
    const initdate = DateTime.now().setZone('utc+9').plus({ hours: 1 }).startOf('hour').toJSDate()

    const [lessonType, setLessonType] = useState('')
    const [startTime, setStartTime] = useState(initdate)
    const [duration, setDuration] = useState(1)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [ticketIds, setTicketIds] = useState([])


    const [createLesson, { loading: cl_loading, error: cl_error }] = useMutation(CREATE_APPRENTICE_LESSON_FROM_INSTRUCTOR_APP, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

            if (d.create_apprentice_lesson_from_instructor_app.success === false) {
                alert('생성 실패')
            }
            else {
                history.push('/')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const [fetchAvailPlans, { loading: fetch_loading, data: fetchAvailPlans_data, error: fetch_error }] = useLazyQuery(FETCH_AVAILABLE_APPRENTICE_PLANS, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

            if (d?.fetch_available_apprentice_plans?.success === false) {
                alert('플랜 조회 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })



    useEffect(() => {

        if (activityType === null || groupingType === null) return
        fetchAvailPlans({
            variables: {
                activity_type: activityType,
                grouping_type: groupingType
            }
        })
    }, [activityType, groupingType])

    const is_submit_disabled = () => {
        if (activityType === null || groupingType === null || startTime === null ) return true

        if (duration < 1) {
            return true
        }

        if (duration !== ticketIds.length) {
            return true
        }


        return false
    }


    return (
        <div className="fwh flex flex-col" style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <span className='flex flex-row jc ac' style={{ width: '100%', marginTop: '1rem' }}>강사주도 수업생성</span>

            <Table>

                <TableRow>
                    <TableCell>액티비티 종류</TableCell>
                    <TableCell>

                        <Select value={activityType} onChange={e => setActivityType(e.target.value)}>
                            {ACTIVITY_TYPES.map(d => <MenuItem value={d}>{activity_type_to_kor_str(d)}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>그룹 종류</TableCell>
                    <TableCell>

                        <Select value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                            {GROUPING_TYPES.map(d => <MenuItem value={d}>{grouping_type_to_kor_str(d)}</MenuItem>)}
                        </Select>
                    </TableCell>
                </TableRow>


                <TableRow>
                    <TableCell>수업시간</TableCell>
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
                                        style={{ width: '10rem' }}

                                    />
                                </MuiPickersUtilsProvider>

                            </Grid>
                            <Grid item xs={12} md={6} className='flex flex-row ac' style={{ justifyContent: 'start' }}>

                                <span>길이</span>
                                <Select value={duration} onChange={e => {
                                    console.log(e)
                                    setDuration(e.target.value)
                                }}>
                                    {[1, 2, 3, 4, 5, 6].map(a => <MenuItem value={a}>{a}시간</MenuItem>)}
                                </Select>
                            </Grid>
                        </Grid>




                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        티켓
                    </TableCell>
                    <TableCell className='flex flex-col'>
                        {(() => {
                            if (activityType === null || groupingType === null) {
                                return <span>수업 액티비티/그룹 종류를 선택해주세요</span>
                            }

                            if (fetch_loading) {
                                return <CircularProgress />
                            }

                            if (fetch_error || fetchAvailPlans_data?.fetch_available_apprentice_plans?.success === false) {
                                return <span>에러</span>
                            }


                            const plandata = fetchAvailPlans_data?.fetch_available_apprentice_plans?.plans

                            if (!plandata) {
                                return null
                            }

                            console.log(plandata)

                            if (plandata?.length === 0) {
                                return <span>사용 가능한 플랜이 없음</span>
                            }

                            // sort by closest expire date


                            plandata.sort((a, b) => {
                                let a_date = null, b_date = null

                                a_date = get_closest_expire_time_of_avail_ticket(a.tickets)
                                b_date = get_closest_expire_time_of_avail_ticket(b.tickets)

                                if (a_date === null && b_date === null) {
                                    return 0
                                }
                                if (a_date === null && b_date !== null) {
                                    return 1
                                }
                                if (a_date !== null && b_date === null) {
                                    return -1
                                }
                                if (a_date > b_date) {
                                    return 1
                                }
                                return -1
                            })

                            let final_output = [
                                <div><span style={{ color: ticketIds.length === duration ? 'black' : 'red' }}>선택된 티켓 개수: {ticketIds.length}/{duration}</span></div>
                            ]

                            final_output = final_output.concat(plandata.map(x => <div className='flex flex-row jc ac' style={{backgroundColor: '#dedede', borderRadius: '1rem', marginTop: '0.2rem', marginBottom: '0.2rem'}}>
                                <div className='flex flex-col jc ac' style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                                    <span>생성일:{DateTime.fromMillis(parseInt(x.created)).setZone('utc+9').toFormat('y-LL-dd')}</span>
                                    <span>가장빠른 만료일: {(() => {
                                        // find avail ticket with fastest expire time
                                        let output = null
                                        for (let y of x.tickets) {
                                            if (y.consumed_time != null) {
                                                continue
                                            }
                                            if (ticketIds.includes(y.id)) {
                                                continue
                                            }
                                            if (output === null) {
                                                console.log(y.expire_time)
                                                const b = DateTime.fromISO(y.expire_time)
                                                console.log(b)
                                                output = b
                                            }
                                            else if (DateTime.fromISO(y.expire_time) < output) {
                                                output = DateTime.fromISO(y.expire_time)
                                            }
                                        }
                                        console.log('output')
                                        console.log(output)

                                        if (output === null) {
                                            return null
                                        }
                                        const outstr = output.toFormat('y-LL-dd')
                                        console.log(outstr)

                                        return outstr

                                    })()}</span>
                                    <span>사용가능 횟수: {x.tickets.filter(a=>{
                                        if(!is_ticket_available(a)){
                                            return false
                                        }

                                        if(is_ticket_already_selected(a, ticketIds)){
                                            return false
                                        }

                                        return true

                                    }).length}</span>
                                </div>
                                <div className='flex flex-row jc ac' style={{ marginLeft: '0.3rem', marginRight: '0.3rem', width: '2rem', height: '2rem', borderRadius: '1rem', backgroundColor: 'gray', color: 'white' }} onClick={() => {
                                    // remove from end of ticket ids which is part of current tickets
                                    for (let i = 0; i < ticketIds.length; i++) {
                                        const tid = ticketIds[ticketIds.length - 1 - i]

                                        if (x.tickets.map(y => y.id).includes(tid)) {
                                            const new_ticketids = ticketIds.filter(z => z !== tid)
                                            setTicketIds(new_ticketids)
                                            return
                                        }

                                    }
                                }}>
                                    <span>-</span>
                                </div>
                                <div>
                                    {(() => {
                                        // check count
                                        let count = 0
                                        console.log('ticketids')
                                        console.log(ticketIds)
                                        for (let a of ticketIds) {
                                            for (let b of x.tickets) {
                                                if (a === b.id) {
                                                    count++
                                                }
                                            }
                                        }

                                        return count
                                    })()}
                                </div>
                                <button className='flex flex-row jc ac' style={{ marginLeft: '0.3rem', marginRight: '0.3rem', width: '2rem', height: '2rem', borderRadius: '1rem', backgroundColor: 'gray', color: 'white' }} onClick={() => {
                                    // find avail, fastest expiring ticket id
                                    let output = null

                                    for (let a of x.tickets) {
                                        if (a.consumed_time != null) {
                                            continue
                                        }

                                        if (ticketIds.includes(a.id)) {
                                            continue
                                        }
                                        const exp_time = DateTime.fromISO(a.expire_time)

                                        if (exp_time < DateTime.now()) {
                                            continue
                                        }

                                        if (output === null) {
                                            output = a
                                        }
                                        else if (DateTime.fromISO(output.expire_time) > DateTime.fromISO(a.expire_time)) {
                                            output = a
                                        }
                                    }

                                    console.log('output')
                                    console.log(output)

                                    if (output !== null) {
                                        setTicketIds([...ticketIds, output.id])
                                    }

                                }} disabled={(() => {
                                    if (ticketIds.length >= duration) {
                                        return true
                                    }
                                    return false
                                })()}>
                                    <span>+</span>
                                </button>
                            </div>))


                            return final_output




                        })()}
                    </TableCell>
                </TableRow>
            </Table>

            <div className='flex flex-row jc ac gap' style={{ padding: '1rem' }}>
                <Button variant='outlined' onClick={() => {
                    history.goBack()
                }} >취소</Button>
                <Button variant='outlined' disabled={is_submit_disabled()} onClick={() => {
                    const _var = {
                        activity_type: activityType,
                        grouping_type: groupingType,
                        start_time: DateTime.fromJSDate(startTime).setZone('utc+9').toHTTP(),
                        duration: duration,
                        ticket_ids: ticketIds
                    }

                    console.log(_var)

                    createLesson({
                        variables: _var
                    })
                }} >생성</Button>
            </div>

        </div>
    )
}

export default withRouter(CreateApprenticeLesson)
