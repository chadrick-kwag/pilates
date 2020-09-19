import { Button, Modal } from 'react-bootstrap'
import ClientSearchComponent2 from '../../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'
import InstructorSearchComponent3 from '../../components/InstructorSearchComponent3'

import React from 'react'
import moment from 'moment'

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimeKeeper from 'react-timekeeper';

import {

    DELETE_LESSON_GQL,
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL

} from '../../common/gql_defs'

class AllScheduleViewLessonModal extends React.Component {

    constructor(props) {
        super(props)

        console.log('props')
        console.log(this.props)

        this.state = {
            edit_mode: false,
            edit_info: {
                lesson_date: new Date(parseInt(this.props.view_selected_lesson.starttime)),
                start_time: moment(new Date(parseInt(this.props.view_selected_lesson.starttime))).format('HH:mm'),
                end_time: moment(new Date(parseInt(this.props.view_selected_lesson.endtime))).format('HH:mm'),
                instructorid: this.props.view_selected_lesson.instructorid

            }
        }

        this.delete_lesson = this.delete_lesson.bind(this)
        this.submit_edit_changes = this.submit_edit_changes.bind(this)
        this.valid_check_edit_info = this.valid_check_edit_info.bind(this)
        this.get_edit_info_start_end_moment = this.get_edit_info_start_end_moment.bind(this)

    }


    delete_lesson() {
        this.props.apolloclient.mutate({
            mutation: DELETE_LESSON_GQL,
            variables: {
                lessonid: this.props.view_selected_lesson.id
            }
        }).then(d => {
            console.log(d)
            if (d.data.delete_lesson.success) {

                this.props.onDeleteSuccess()
            }
            else {
                alert('failed to delete lesson')
            }
        }).catch(e => {
            console.log('error deleting lesson')
            alert('failed to delete lesson')
        })
    }

    valid_check_edit_info() {

        let [start_m, end_m] = this.get_edit_info_start_end_moment()

        if (!start_m.isBefore(end_m)) {
            return "start time is before end time"
        }

        return null

    }

    get_edit_info_start_end_moment() {
        // check time validation
        let ei = this.state.edit_info

        console.log(ei)

        let date_m = moment(ei.lesson_date)
        let start_time_m = moment(ei.start_time, 'HH:mm')
        let end_time_m = moment(ei.end_time, 'HH:mm')

        console.log(date_m)
        console.log(start_time_m)
        console.log(end_time_m)

        let start_m = moment(date_m)
        let end_m = moment(date_m)

        console.log(start_time_m.hour())
        console.log(start_time_m.minute())

        start_m.hour(start_time_m.hour())
        start_m.minute(start_time_m.minute())
        start_m.second(start_time_m.second())

        end_m.set({
            hour: end_time_m.get('hour'),
            minute: end_time_m.get('minute'),
            second: end_time_m.get('second')
        })
        console.log('end_m')
        console.log(end_m)


        return [start_m, end_m]

    }

    submit_edit_changes() {


        let check_result = this.valid_check_edit_info()

        if (check_result != null) {
            alert(check_result)
            return
        }

        let [start_m, end_m] = this.get_edit_info_start_end_moment()



        let _var = {
            lessonid: parseInt(this.props.view_selected_lesson.id),
            start_time: start_m.toDate().toUTCString(),
            end_time: end_m.toDate().toUTCString(),
            instructor_id: parseInt(this.state.edit_info.instructorid)

        }

        console.log(_var)

        // try to register lesson
        this.props.apolloclient.mutate({
            mutation: UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
            variables: _var
        }).then(d => {
            console.log(d)
        }).catch(e => {
            console.log(JSON.stringify(e))
        })



    }



    render() {


        console.log(this.state.edit_info)
        // let datepicker_init_date = new Date(parseInt(this.state.edit_info.start_time))

        // console.log(datepicker_init_date)
        let modal_body = null

        if (this.state.edit_mode) {



            modal_body = <Modal.Body>
                <div>
                    <div className="flex-col-left-align">
                        <h3>회원</h3>
                        <span>이름: {this.props.view_selected_lesson.clientname}</span>
                        <span>연락처: {this.props.view_selected_lesson.client_phonenumber}</span>
                    </div>

                    <hr></hr>

                    <InstructorSearchComponent3 apolloclient={this.props.apolloclient} init_instructor_id={this.props.view_selected_lesson.instructorid} instructorSelectedCallback={info => {

                        console.log(info)
                        let existing_edit_info = this.state.edit_info

                        existing_edit_info.instructorid = info.id

                        this.setState({
                            edit_info: existing_edit_info
                        })
                    }} />

                    <hr></hr>

                    <div className="padded-block col-gravity-center">
                        <h2>수업시간선택</h2>

                        <div>
                            <span className="bold small-margined">날짜선택</span>
                            <DatePicker
                                selected={this.state.edit_info.lesson_date}
                                locale="ko"

                                onChange={e => {
                                    let update_edit_info = this.state.edit_info
                                    update_edit_info.lesson_date = e

                                    this.setState({
                                        edit_info: update_edit_info
                                    })

                                }
                                }
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
                                    time={this.state.edit_info.start_time}
                                    onChange={(data) => {
                                        console.log(data)
                                        let update_edit_info = this.state.edit_info
                                        update_edit_info.start_time = data.formatted24

                                        console.log('update start time')
                                        console.log(update_edit_info)
                                        this.setState({
                                            edit_info: update_edit_info
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
                                    time={this.state.edit_info.end_time}
                                    onChange={(data) => {
                                        console.log(data)
                                        let update_edit_info = this.state.edit_info
                                        update_edit_info.end_time = data.formatted24

                                        console.log('update end time')
                                        console.log(update_edit_info)

                                        this.setState({
                                            edit_info: update_edit_info
                                        })
                                    }}
                                />

                            </div>


                        </div>

                    </div>

                </div>
            </Modal.Body>
        }
        else {

            let datetimestr

            let moment_date = moment(new Date(parseInt(this.props.view_selected_lesson.starttime)))


            let end_moment = moment(new Date(parseInt(this.props.view_selected_lesson.endtime)))


            datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
            let endstr = end_moment.format("hh:mm A")

            datetimestr = datetimestr + endstr

            modal_body = <Modal.Body>
                <div>
                    <h2>회원</h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: "column"

                    }}>
                        <span>이름: {this.props.view_selected_lesson.clientname}</span>
                        <span>연락처: {this.props.view_selected_lesson.client_phonenumber}</span>

                    </div>
                    <hr></hr>

                    <h2>강사</h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: "column"

                    }}>
                        <span>이름: {this.props.view_selected_lesson.instructorname}</span>
                        <span>연락처: {this.props.view_selected_lesson.instructor_phonenumber}</span>
                    </div>
                    <hr></hr>
                    <div>
                        <span>{datetimestr}</span>
                    </div>

                </div>
            </Modal.Body>
        }

        let modal_footer = null

        if (this.state.edit_mode) {
            modal_footer = <Modal.Footer>
                <Button onClick={e => {
                    this.setState({
                        edit_mode: false
                    })
                }}>cancel</Button>
                <Button onClick={e => {

                    this.submit_edit_changes()

                }}>Done</Button>
            </Modal.Footer>
        }
        else {
            modal_footer = <Modal.Footer>
                <Button onClick={e => {
                    this.setState({
                        edit_mode: true
                    })
                }}>
                    시간/강사변경
            </Button>
                <Button onClick={e => {
                    this.delete_lesson()
                }}>delete</Button>
                <Button onClick={e => {
                    this.props.onCancel()
                }
                }>Close</Button>
            </Modal.Footer>
        }


        return <Modal show={true} onHide={() => this.props.onCancel()} dialogClassName="modal-90w" >
            {modal_body}
            {modal_footer}
        </Modal>

    }
}

export default AllScheduleViewLessonModal