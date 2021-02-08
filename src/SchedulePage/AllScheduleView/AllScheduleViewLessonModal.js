import { Button, Modal } from 'react-bootstrap'
import InstructorSearchComponent3 from '../../components/InstructorSearchComponent3'

import React from 'react'
import moment from 'moment'
import client from '../../apolloclient'

import {
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL

} from '../../common/gql_defs'

import { DatePicker, TimePicker } from '@material-ui/pickers'
import PersonProfileCard from '../../components/PersonProfileCard'
import { activity_type_to_kor } from '../../common/consts'

class AllScheduleViewLessonModal extends React.Component {

    constructor(props) {

        super(props)

        console.log('props')
        console.log(this.props)
        this.state = {
            edit_mode: false,
            edit_info: {
                lesson_date: new Date(parseInt(this.props.view_selected_lesson.starttime)),
                start_time: new Date(parseInt(this.props.view_selected_lesson.starttime)),
                end_time: new Date(parseInt(this.props.view_selected_lesson.endtime)),
                instructorid: this.props.view_selected_lesson.instructorid,

                show_delete_ask_modal: false

            }

        }

        this.submit_edit_changes = this.submit_edit_changes.bind(this)
        this.valid_check_edit_info = this.valid_check_edit_info.bind(this)
        this.get_edit_info_start_end_moment = this.get_edit_info_start_end_moment.bind(this)
        this.delete_lesson_with_request_type = this.delete_lesson_with_request_type.bind(this)

    }



    delete_lesson_with_request_type(request_type, ignore_warning = false) {

        client.mutate({
            mutation: DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
            variables: {
                lessonid: this.props.view_selected_lesson.id,
                ignore_warning: ignore_warning,
                request_type: request_type
            }
        }).then(d => {
            console.log(d)

            if (d.data.delete_lesson_with_request_type.penalty_warning === true) {

                let ret = confirm(d.data.delete_lesson_with_request_type.msg)

                if (ret) {
                    this.delete_lesson_with_request_type(request_type, true)
                }

                // if do not proceed
                return
            }

            if (d.data.delete_lesson_with_request_type.success) {

                this.props.onDeleteSuccess()
            }
            else {
                alert('failed to delete lesson.' + d.data.delete_lesson_with_request_type.msg)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log('error deleting lesson')
            alert('failed to delete lesson')
        })
    }

    valid_check_edit_info() {

        let [start_m, end_m] = this.get_edit_info_start_end_moment()

        if (start_m >= end_m) {
            return 'start time is after end time'
        }


        return null

    }

    get_edit_info_start_end_moment() {

        let start_date = new Date(this.state.edit_info.lesson_date)
        let end_date = new Date(this.state.edit_info.lesson_date)

        let start_h = this.state.edit_info.start_time.getHours()
        let start_m = this.state.edit_info.start_time.getMinutes()

        start_date.setHours(start_h)
        start_date.setMinutes(start_m)
        start_date.setMilliseconds(0)


        let end_h = this.state.edit_info.end_time.getHours()
        let end_m = this.state.edit_info.end_time.getMinutes()

        end_date.setHours(end_h)
        end_date.setMinutes(end_m)
        end_date.setMilliseconds(0)

        return [start_date, end_date]

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
            start_time: start_m.toUTCString(),
            end_time: end_m.toUTCString(),
            instructor_id: parseInt(this.state.edit_info.instructorid)
        }

        console.log("mutate variables:")
        console.log(_var)

        // try to register lesson
        client.mutate({
            mutation: UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
            variables: _var
        }).then(d => {
            console.log(d)

            if (d.data.update_lesson_instructor_or_time.success) {
                this.props.onEditSuccess()
            }
            else {
                alert(`failed to submit edit\n${d.data.update_lesson_instructor_or_time.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('error submitting edit')
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

                            <DatePicker
                                autoOk
                                orientation="landscape"
                                variant="static"
                                openTo="date"
                                value={this.state.edit_info.lesson_date}
                                onChange={d => {
                                    console.log(d)
                                    let update_edit_info = {}
                                    Object.assign(update_edit_info, this.state.edit_info)
                                    update_edit_info.lesson_date = d
                                    this.setState({
                                        edit_info: update_edit_info
                                    })
                                }}
                            />
                        </div>


                        <div style={{ display: "flex", flexDirection: "row" }} className="small-margined">


                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <span>시작</span>


                                <TimePicker
                                    autoOk
                                    ampm={false}
                                    variant="static"
                                    orientation="portrait"
                                    openTo="hours"
                                    minutesStep="5"
                                    value={this.state.edit_info.start_time}
                                    onChange={d => {
                                        console.log(d)
                                        let new_info = {}
                                        Object.assign(new_info, this.state.edit_info)
                                        new_info.start_time = d
                                        this.setState({
                                            edit_info: new_info
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

                                <TimePicker
                                    autoOk
                                    ampm={false}
                                    variant="static"
                                    orientation="portrait"
                                    openTo="hours"
                                    minutesStep="5"
                                    value={this.state.edit_info.end_time}
                                    onChange={d => {
                                        console.log(d)
                                        let new_info = {}
                                        Object.assign(new_info, this.state.edit_info)
                                        new_info.end_time = d
                                        this.setState({
                                            edit_info: new_info
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
            // not edit mode

            let datetimestr

            let moment_date = moment(new Date(parseInt(this.props.view_selected_lesson.starttime)))


            let end_moment = moment(new Date(parseInt(this.props.view_selected_lesson.endtime)))


            datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
            let endstr = end_moment.format("hh:mm A")

            datetimestr = datetimestr + endstr

            modal_body = <Modal.Body>
                <div className='row-gravity-center'>
                    <div className='col-gravity-center'>
                        <h2>회원</h2>

                        <PersonProfileCard name={this.props.view_selected_lesson.clientname} phonenumber={this.props.view_selected_lesson.client_phonenumber} style={{ margin: '10px' }} />
                    </div>
                    <div className='col-gravity-center'>
                        <h2>강사</h2>

                        <PersonProfileCard variant='dark' name={this.props.view_selected_lesson.instructorname} phonenumber={this.props.view_selected_lesson.instructor_phonenumber} style={{ margin: '10px' }} />
                    </div>

                </div>
                <div className='col-gravity-center'>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{datetimestr}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activity_type_to_kor[this.props.view_selected_lesson.activity_type]} 수업</span>
                </div>
            </Modal.Body>
        }

        console.log(this.props.view_selected_lesson)

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

                    this.setState({
                        show_delete_ask_modal: true
                    })


                }}>delete</Button>

                <Button onClick={e => {
                    this.props.onCancel()
                }
                }>Close</Button>
            </Modal.Footer>
        }


        return <div>
            <Modal show={true} onHide={() => this.props.onCancel()} dialogClassName="modal-90w" >
                {modal_body}
                {modal_footer}
            </Modal>

            <Modal show={this.state.show_delete_ask_modal} onHide={() => this.setState({
                show_delete_ask_modal: false
            })}>
                <Modal.Body>
                    <div className="col-gravity-center">
                        <Button className="small-margined" onClick={e => this.delete_lesson_with_request_type('CLIENT_REQUEST')}>고객요청</Button>
                        <Button className="small-margined" onClick={e => this.delete_lesson_with_request_type('INSTRUCTOR_REQUEST')}>강사요청</Button>
                        <Button className="small-margined" onClick={e => this.delete_lesson_with_request_type('ADMIN_REQUEST')}>관리자권한 강제요청</Button>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={e => {
                        this.setState({
                            show_delete_ask_modal: false
                        })
                    }}>cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>

    }
}

export default AllScheduleViewLessonModal