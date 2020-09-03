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

    DELETE_LESSON_GQL

} from '../../common/gql_defs'

class AllScheduleViewLessonModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            edit_mode: false,
            edit_info: {
                lesson_date: new Date(parseInt(this.props.view_selected_lesson.starttime)),
                start_time: moment(new Date(parseInt(this.props.view_selected_lesson.starttime))).format('HH:mm'),
                end_time: moment(new Date(parseInt(this.props.view_selected_lesson.endtime))).format('HH:mm'),
                instructorid: this.props.instructorid

            }
        }

        this.delete_lesson = this.delete_lesson.bind(this)
        this.submit_edit_changes = this.submit_edit_changes.bind(this)

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


    submit_edit_changes() {

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