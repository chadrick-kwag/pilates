import React, { useState } from 'react'

import InstructorSearchComponent3 from '../components/InstructorSearchComponent3'
import { DatePicker } from "@material-ui/pickers";

import client from '../apolloclient'
import { Button, Table, Spinner } from 'react-bootstrap'
import { QUERY_LESSON_DATA_OF_INSTRUCTORID } from '../common/gql_defs'
import { DateTime } from 'luxon'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import numeral from 'numeral'
import ErrorIcon from '@material-ui/icons/Error';

import { CircularProgress, Grid } from '@material-ui/core'


import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import koLocale from "date-fns/locale/ko";

import DateFnsUtils from "@date-io/date-fns";

export default function InstructorStatManagePage(props) {

    const [viewedInstructor, setViewedInstructor] = useState(null)
    const [viewedMonth, setViewedMonth] = useState(new Date())
    const [lessonData, setLessonData] = useState(null)
    const [fetchState, setFetchState] = useState('init')



    const fetch_month_lesson_data = () => {

        let search_starttime = new Date(viewedMonth)
        search_starttime.setDate(1)
        search_starttime.setHours(0)
        search_starttime.setMinutes(0)
        search_starttime.setSeconds(0)
        search_starttime.setMilliseconds(0)


        let search_endtime = new Date(viewedMonth)
        search_endtime.setMonth(search_endtime.getMonth() + 1)
        search_endtime.setDate(1)
        search_endtime.setHours(0)
        search_endtime.setMinutes(0)
        search_endtime.setSeconds(0)
        search_endtime.setMilliseconds(0)

        let _var = {
            instructorid: parseInt(viewedInstructor.id),
            search_starttime: search_starttime.toUTCString(),
            search_endtime: search_endtime.toUTCString()
        }

        console.log(_var)

        setLessonData(null)

        client.query({
            query: QUERY_LESSON_DATA_OF_INSTRUCTORID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.query_lesson_data_of_instructorid.success) {

                setLessonData(res.data.query_lesson_data_of_instructorid.lesson_info_arr)
                setFetchState('done')
            }
            else {
                const msg = res.data.query_lesson_data_of_instructorid.msg
                alert(`query fail. msg: ${msg}`)

                setFetchState('error')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('query error')

            setFetchState('error')
        })

    }


    const check_view_request_button_disabled = () => {

        if (viewedInstructor === null || viewedMonth === null) {
            return true
        }

        return false
    }

    return (

        <Grid container>

            <Grid item xs={12}>
                <div className='row-gravity-center children-padding'>

                    <InstructorSearchComponent3
                        instructorSelectedCallback={d => {
                            setViewedInstructor(d)
                        }}
                    />

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
                        setFetchState('loading')
                        fetch_month_lesson_data()
                    }}>조회</Button>
                </div>

            </Grid>

            <Grid item xs={12}>
                {(() => {
                    if (fetchState === 'init') {
                        return <div className='row-gravity-center'>
                            <span>강사와 조회할 달을 선택해주세요</span>
                        </div>
                    }

                    if (fetchState === 'error') {
                        return <div className='row-gravity-center'>
                            <ErrorIcon />
                        </div>
                    }

                    if (fetchState === 'loading') {
                        return <div className='row-gravity-center'>
                            <CircularProgress />
                        </div>
                    }

                    if (fetchState === 'done') {
                        return (
                            <div className='col-gravity-center' style={{ width: '100%' }}>
                                <div>
                                    <span style={{ fontSize: '2rem' }}>{viewedInstructor.name} 강사님 ({viewedInstructor.phonenumber}) / {DateTime.fromJSDate(viewedMonth).setZone('UTC+9').toFormat('y년 LL월')}</span>
                                </div>
                                <div className='row-gravity-center' style={{ width: '100%' }}>

                                    <Table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>수업일시</th>
                                                <th>회원</th>
                                                <th>수업종류</th>
                                                <th>수강료합산</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lessonData.sort((a, b) => parseInt(a.starttime) - parseInt(b.starttime)).map((d, i) => {
                                                return <tr>
                                                    <td>{i + 1}</td>
                                                    <td>{DateTime.fromMillis(parseInt(d.starttime)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}~{DateTime.fromMillis(parseInt(d.endtime)).setZone('UTC+9').toFormat('HH:mm')}</td>
                                                    <td>{d.client_info_arr.map(a => a.name).join(',')}</td>
                                                    <td>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</td>
                                                    <td>{numeral(d.totalcost).format('0,0')}</td>
                                                </tr>
                                            })}
                                            <tr>
                                                <td colSpan='4'><div className='row-gravity-right'><span>total</span></div></td>
                                                <td>{numeral(lessonData.reduce((total, a) => total + parseInt(a.totalcost), 0)).format('0,0')}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>

                        )

                    }
                })()}



            </Grid>
        </Grid>

    )
}