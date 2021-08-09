import React, { useState } from 'react'


import InstructorSearchComponent4 from '../components/InstructorSearchComponent4'
import { DatePicker } from "@material-ui/pickers";

import client from '../apolloclient'

import { QUERY_LESSON_DATA_OF_INSTRUCTORID, QUERY_TEACH_HISTORY_OF_INSTRUCTOR_IN_TIMERANGE } from '../common/gql_defs'
import { DateTime } from 'luxon'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import numeral from 'numeral'
import ErrorIcon from '@material-ui/icons/Error';

import { CircularProgress, Grid, Table, Button, TableRow, TableCell } from '@material-ui/core'


import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import { useLazyQuery } from '@apollo/client'

function InstructorStatManagePage() {

    const [viewedInstructor, setViewedInstructor] = useState(null)
    const [viewedMonth, setViewedMonth] = useState(new Date())
    const [lessonData, setLessonData] = useState(null)

    const [shownInstructor, setShownInstructor] = useState(null)



    // const [fetchInstructors, { loading: fechtinstructor_loading, error: fetchinstructor_error }] = useLazyQuery()

    const [fetchHistory, { loading: fetchhistory_loading, data: teachHistoryResponse, error: fetchhistory_error }] = useLazyQuery(QUERY_TEACH_HISTORY_OF_INSTRUCTOR_IN_TIMERANGE, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.query_teach_history_of_instructor_in_timerange?.success === false) {
                alert('데이터 조회 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))

            alert('데이터 조회 에러')
        }
    })

    const fetch_month_lesson_data = () => {


        setShownInstructor(viewedInstructor)

        let search_starttime = DateTime.fromJSDate(viewedMonth).setZone('utc+9').startOf('month')



        let search_endtime = DateTime.fromJSDate(viewedMonth).setZone('utc+9').endOf('month')


        let _var = {
            personid: parseInt(viewedInstructor.personid),
            search_starttime: search_starttime.toHTTP(),
            search_endtime: search_endtime.toHTTP()
        }

        console.log(_var)

        fetchHistory({
            variables: _var
        })


    }


    const check_view_request_button_disabled = () => {

        if (viewedInstructor === null || viewedMonth === null) {
            return true
        }

        return false
    }

    return (
        <div classname="fwh flexcol" style={{ maxHeight: '100%', maxWidth: '100%' }}>
            <div >
                <Grid container>
                    <Grid item xs={12} sm={6} className="flexrow align-center justify-center">
                        <InstructorSearchComponent4 onInstructorSelected={d => setViewedInstructor(d)} />
                    </Grid>
                    <Grid item xs={12} sm={6} className="flexrow align-center justify-center">
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                            <DatePicker
                                autoOk
                                variant="inline"
                                openTo="year"
                                views={["year", "month"]}

                                helperText="조회할 월을 선택해주세요"
                                value={viewedMonth}
                                onChange={d => {
                                    setViewedMonth(d)
                                }}
                            />
                        </MuiPickersUtilsProvider>



                        <Button disabled={check_view_request_button_disabled()} onClick={() => {

                            fetch_month_lesson_data()
                        }}>조회</Button>
                    </Grid>
                </Grid>

            </div>

            <div style={{ flex: '1 0 0', overflow: 'auto', maxHeight: '100%' }}>

                {(() => {
                    if (fetchhistory_loading) {
                        return <div className="fwh flexrow justify-center align-center">
                            <CircularProgress />
                        </div>
                    }

                    if (fetchhistory_error || teachHistoryResponse?.query_teach_history_of_instructor_in_timerange?.success === false) {
                        return <div className="fwh flexrow justify-center align-center">
                            <span>에러</span>
                        </div>
                    }

                    if ((teachHistoryResponse ?? null) === null) {
                        return null
                    }


                    const teach_history_arr = teachHistoryResponse.query_teach_history_of_instructor_in_timerange.teach_history_arr.map(d => {

                        const client_name_set = new Set()
                        let totalcost = 0

                        for (let ticket of d.tickets) {

                            console.log(ticket)
                            totalcost += ticket.cost
                            client_name_set.add(ticket.studentname)
                        }

                        d.totalcost = totalcost
                        d.client_name_arr = Array.from(client_name_set)

                        return d
                    })


                    return <div className="flexcol" style={{ maxHeight: '100%' }}>
                        <span style={{ fontSize: '1.5rem', wordBreak: 'keep-all' }}>{shownInstructor.name} 강사님 ({shownInstructor.phonenumber}) / {DateTime.fromJSDate(viewedMonth).setZone('UTC+9').toFormat('y년 LL월')}</span>
                        <Table>
                            <TableRow>
                                <TableCell className="nowb">#</TableCell>
                                <TableCell className="nowb">수업실시</TableCell>
                                <TableCell className="nowb">회원</TableCell>
                                <TableCell className="nowb">수업종류</TableCell>
                                <TableCell className="nowb">티켓값합산</TableCell>

                            </TableRow>

                            <tbody>
                                {teach_history_arr.sort((a, b) => parseInt(a.starttime) - parseInt(b.starttime)).map((d, i) => {



                                    return <TableRow>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{DateTime.fromMillis(parseInt(d.starttime)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}~{DateTime.fromMillis(parseInt(d.endtime)).setZone('UTC+9').toFormat('HH:mm')}</TableCell>
                                        <TableCell style={{ wordBreak: 'keep-all' }}>{d.client_name_arr.join(', ')}</TableCell>
                                        <TableCell style={{ wordBreak: 'keep-all' }}>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</TableCell>
                                        <TableCell style={{ wordBreak: 'keep-all' }}>{numeral(d.totalcost).format('0,0')}</TableCell>
                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell colSpan='4'><div className='row-gravity-right'><span>total</span></div></TableCell>
                                    <TableCell>
                                        {numeral(teach_history_arr.reduce((a, c) => {
                                            console.log(a)
                                            console.log(c)
                                            return a + c.totalcost
                                        }, 0)).format('0,0')}
                                    </TableCell>
                                </TableRow>
                            </tbody>
                        </Table>
                    </div>
                })()}


            </div>



        </div>


    )
}


export default InstructorStatManagePage