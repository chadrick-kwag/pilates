import React, { useState } from 'react'

import InstructorSearchComponent3 from '../components/InstructorSearchComponent3'
import { DatePicker } from "@material-ui/pickers";

import client from '../apolloclient'
import { Button, Table, Spinner } from 'react-bootstrap'
import { QUERY_LESSON_DATA_OF_INSTRUCTORID } from '../common/gql_defs'
import { DateTime } from 'luxon'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import numeral from 'numeral'

export default function InstructorStatManagePage(props) {


    const [state, setState] = useState({
        selected_instructor: null,
        selected_month: new Date(),
        lesson_data: 'init'
    })

    const [viewedInstructor, setViewedInstructor] = useState(null)
    const [viewedMonth, setViewedMonth] = useState(null)



    const fetch_month_lesson_data = () => {

        let search_starttime = new Date(state.selected_month)
        search_starttime.setDate(1)
        search_starttime.setHours(0)
        search_starttime.setMinutes(0)
        search_starttime.setSeconds(0)
        search_starttime.setMilliseconds(0)


        let search_endtime = new Date(state.selected_month)
        search_endtime.setMonth(search_endtime.getMonth() + 1)
        search_endtime.setDate(1)
        search_endtime.setHours(0)
        search_endtime.setMinutes(0)
        search_endtime.setSeconds(0)
        search_endtime.setMilliseconds(0)

        let _var = {
            instructorid: parseInt(state.selected_instructor.id),
            search_starttime: search_starttime.toUTCString(),
            search_endtime: search_endtime.toUTCString()
        }

        console.log(_var)

        let newstate = _.cloneDeep(state)
        newstate.lesson_data = null
        setState(newstate)

        client.query({
            query: QUERY_LESSON_DATA_OF_INSTRUCTORID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.query_lesson_data_of_instructorid.success) {


                let newstate = _.cloneDeep(state)
                newstate.lesson_data = res.data.query_lesson_data_of_instructorid.lesson_info_arr
                setState(newstate)
            }
            else {
                alert('query fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('query error')
        })

    }


    const check_view_request_button_disabled = () => {
        if (state.selected_instructor === null || state.selected_month === null) {
            return true
        }

        return false
    }

    return (
        <div>
            <div className='row-gravity-center children-padding'>
                <InstructorSearchComponent3
                    instructorSelectedCallback={d => {
                        let newstate = _.cloneDeep(state)
                        newstate.selected_instructor = d
                        setState(newstate)
                    }}
                />

                <DatePicker
                    autoOk
                    variant="inline"
                    openTo="year"
                    views={["year", "month"]}

                    helperText="조회할 월을 선택해주세요"
                    value={state.selected_month}
                    onChange={d => {

                        console.log(d)

                        if (d.getMonth() !== state.selected_month.getMonth() || d.getFullYear() !== state.selected_month.getFullYear()) {
                            let news = _.cloneDeep(state)
                            news.selected_month = d
                            setState(news)
                        }


                    }}
                />
                <Button disabled={check_view_request_button_disabled()} onClick={_ => {
                    setViewedInstructor(state.selected_instructor)
                    setViewedMonth(state.selected_month)
                    fetch_month_lesson_data()}}>조회</Button>

            </div>
            <div>

                {state.lesson_data === null ? <Spinner animation='border' /> : null}
                {state.lesson_data !== null && state.lesson_data !== 'init' ?
                    <div>
                        <div>
                            <h3>{viewedInstructor.name} 강사 / {viewedMonth.getFullYear() + '년 ' + (viewedMonth.getMonth() + 1) + '월'}</h3>
                        </div>
                        {state.lesson_data.length === 0 ? <div>no lesson data</div> :
                            <div>

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
                                        {state.lesson_data.sort((a, b) => parseInt(a.starttime) - parseInt(b.starttime)).map((d, i) => {
                                            return <tr>
                                                <td>{i+1}</td>
                                                <td>{DateTime.fromMillis(parseInt(d.starttime)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</td>
                                                <td>{d.client_info_arr.map(a => a.name).join(',')}</td>
                                                <td>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</td>
                                                <td>{numeral(d.netvalue).format('0,0')}</td>
                                            </tr>
                                        })}
                                        <tr>
                                            <td colSpan='4'><div className='row-gravity-right'><span>total</span></div></td>
                                            <td>{numeral(state.lesson_data.reduce((total, a) => total + parseInt(a.netvalue), 0)).format('0,0')}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        }
                    </div>

                    : null}

            </div>
        </div>
    )
}