import React from 'react'


import GroupingTypeSelectComponent from '../components/GroupingTypeSelectComponent'
import ActivityTypeSelectComponent from '../components/ActivityTypeSelectComponent'

import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'

import { Button, Table } from 'react-bootstrap'

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ko from 'date-fns/locale/ko';

import moment from 'moment'
import TimeKeeper from 'react-timekeeper';


registerLocale('ko', ko)

import { CREATE_LESSON_GQL, CREATE_INDIVIDUAL_LESSON_GQL } from '../common/gql_defs'

import SelectSubscriptionTicketComponent from '../components/SelectSubscriptionTicketComponent'



class CreateLessonPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            selected_activity_type: null,
            selected_grouping_type: null,
            selected_client: null,
            selected_subscription_ticket: null,
            selected_instructor: null,
            selected_date: new Date(),
            start_time: "12:00",
            end_time: "12:00"
        }

        this.createlesson = this.createlesson.bind(this)
    }

    is_time_later(time1, time2) {



        const reg = /([0-9]+):([0-9]+)/

        let mat = time1.match(reg)
        console.log(mat)
        let time1_hour = mat[1]
        let time1_min = mat[2]

        mat = time2.match(reg)

        let time2_hour = mat[1]
        let time2_min = mat[2]



        if (time1_hour > time2_hour) {
            return true
        }

        else if (time1_hour < time2_hour) {
            return false
        }

        if (time1_min >= time2_min) {
            return true
        }

        if (time1_min < time2_min) {
            return false
        }



    }

    get_hour_and_minute_of_time_string(timestr) {
        const reg = /([0-9]+):([0-9]+)/

        let mat = timestr.match(reg)

        let hour = parseInt(mat[1])
        let min = parseInt(mat[2])

        return [hour, min]

    }


    checkinput() {

        if (this.state.selected_activity_type == null) {
            return 'no selected activity type'
        }

        if (this.state.selected_grouping_type == null) {
            return 'no selected grouping type'
        }

        if (this.state.selected_client == null) {
            console.log('no selected client')
            return 'no selected client'
        }

        if (this.state.selected_subscription_ticket == null) {
            return 'no subscription ticket selected'
        }

        if (this.state.selected_instructor == null) {
            console.log('no selected instructor')
            return 'no selected instructor'
        }

        if (this.state.start_time == null || this.state.end_time == null) {
            console.log('null start/end time')
            return 'null start /end time'
        }

        if (this.state.selected_date == null) {
            console.log('selected date is null')
            return 'selected date is null'
        }

        if (!this.is_time_later(this.state.end_time, this.state.start_time)) {
            console.log("time end start wrong")
            return 'time end start wrong'
        }

        return null


    }

    createlesson() {

        let ret = this.checkinput()

        if (ret != null) {
            console.log('check input failed')
            alert('input invalid\n' + ret)
            return
        }

        let start_datetime = new Date(this.state.selected_date)

        let [start_hour, start_min] = this.get_hour_and_minute_of_time_string(this.state.start_time)
        start_datetime.setHours(start_hour)
        start_datetime.setMinutes(start_min)
        start_datetime.setSeconds(0)
        start_datetime.setMilliseconds(0)
        // console.log(start_datetime.toUTCString())


        let end_datetime = new Date(this.state.selected_date)
        let [end_hour, end_min] = this.get_hour_and_minute_of_time_string(this.state.end_time)
        end_datetime.setHours(end_hour)
        end_datetime.setMinutes(end_min)
        end_datetime.setSeconds(0)
        end_datetime.setMilliseconds(0)

        console.log(end_datetime.toUTCString())
        console.log(start_datetime.toUTCString())


        let vars = {
            clientid: parseInt(this.state.selected_client.id),
            instructorid: parseInt(this.state.selected_instructor.id),
            starttime: start_datetime.toUTCString(),
            endtime: end_datetime.toUTCString(),
            ticketid: parseInt(this.state.selected_subscription_ticket.id)
        }

        console.log('sending vars:')
        console.log(vars)

        this.props.apolloclient.mutate({
            mutation: CREATE_INDIVIDUAL_LESSON_GQL,
            variables: vars
        }).then(d => {
            console.log(d)
            if (d.data.create_individual_lesson.success) {
                console.log('success creating lesson')
                this.props.onCreateSuccess()
                return
            }

            console.log('failed to create lesson')
            alert('failed to create lesson\n' + d.data.create_individual_lesson.msg)



        }).catch(e => {
            console.log('error creating lesson')
            console.log(JSON.stringify(e))
            alert('error creating lesson')
        })
    }

    render() {


        let subscription_selector = null

        if (this.state.selected_grouping_type != null && this.state.selected_activity_type != null && this.state.selected_client != null) {
            subscription_selector = <div className='padded-block col-gravity-center'>
                <h3>플랜선택</h3>
                <SelectSubscriptionTicketComponent apolloclient={this.props.apolloclient}
                    clientid={this.state.selected_client.id}
                    activity_type={this.state.selected_activity_type}
                    grouping_type={this.state.selected_grouping_type}
                    onSubscriptionTicketSelected={d => {
                        console.log('setting selected subscription ticket  to:')
                        console.log(d)
                        this.setState({
                            selected_subscription_ticket: d
                        })
                    }}
                />
            </div>
        }

        return <div className="col-gravity-center">

            <div className="padded-block col-gravity-center">
                <ActivityTypeSelectComponent onItemClicked={d => this.setState({
                    selected_activity_type: d
                })} />
            </div>


            <div className="padded-block col-gravity-center">
                <GroupingTypeSelectComponent onItemClicked={d => this.setState({
                    selected_grouping_type: d
                })} />
            </div>

            <div className="padded-block col-gravity-center">
                <h3>회원선택</h3>

                <ClientSearchComponent2 apolloclient={this.props.apolloclient} clientSelectedCallback={c => this.setState({
                    selected_client: c
                })} />

            </div>

            {subscription_selector}

            <div className="padded-block col-gravity-center">
                <h3>강사선택</h3>

                <InstructorSearchComponent2 apolloclient={this.props.apolloclient} instructorSelectedCallback={i => {
                    console.log(i)
                    this.setState({
                        selected_instructor: i
                    })
                }} />

            </div>

            <div className="padded-block col-gravity-center">
                <h2>수업시간선택</h2>

                <div>
                    <span className="bold small-margined">날짜선택</span>
                    <DatePicker
                        locale="ko"
                        selected={this.state.selected_date}
                        onChange={e => this.setState({
                            selected_date: e
                        })}
                        dateFormat="yyMMdd"

                    />
                </div>


                <div style={{ display: "flex", flexDirection: "row" }} className="small-margined">
                    <span className="bold small-margined">시간선택</span>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <span>시작</span>
                        <TimeKeeper
                            hour24Mode="true"
                            coarseMinutes="5"
                            forceCoarseMinutes="true"
                            switchToMinuteOnHourSelect="true"
                            time={this.state.start_time}
                            onChange={(data) => {
                                console.log(data)
                                this.setState({
                                    start_time: data.formatted24
                                })
                            }}
                        />

                    </div>


                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <span>종료</span>
                        <TimeKeeper

                            hour24Mode="true"
                            coarseMinutes="5"
                            forceCoarseMinutes="true"
                            switchToMinuteOnHourSelect="true"
                            time={this.state.end_time}
                            onChange={(data) => {
                                console.log(data)
                                this.setState({
                                    end_time: data.formatted24
                                })
                            }}
                        />

                    </div>


                </div>

            </div>

            <div className='footer'>
                <Button onClick={e => this.props.cancel_callback()}>취소</Button>
                <Button onClick={e => this.createlesson()}>생성</Button>
            </div>
        </div>
    }
}

export default CreateLessonPage