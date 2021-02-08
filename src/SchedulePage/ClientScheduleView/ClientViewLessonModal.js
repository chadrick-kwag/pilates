import React from 'react'

import { Modal, Button } from 'react-bootstrap'
import client from '../../apolloclient'
import {
    DELETE_LESSON_GQL
} from '../../common/gql_defs'
import LessonInfoComponent from '../LessonInfoComponent'
import moment from 'moment'


export default function ClientViewLessonModal(props) {

    console.log(props)

    let datetimestr

    let moment_date = moment(new Date(parseInt(props.lesson.starttime)))
    let end_moment = moment(new Date(parseInt(props.lesson.endtime)))
    datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
    let endstr = end_moment.format("hh:mm A")

    datetimestr = datetimestr + endstr


    let people = [
        {
            type: 'client',
            name: props.lesson.clientname,
            phonenumber: props.lesson.client_phonenumber
        },
        {
            type: 'instructor',
            name: props.lesson.instructorname,
            phonenumber: props.lesson.instructor_phonenumber
        }
    ]


    return <Modal show={props.show} onHide={props.onHide}>
        <Modal.Body>
            {/* <div>
                <h2>회원</h2>
                <div>
                    <span>이름: {this.state.view_selected_lesson.clientname}</span>

                </div>
                <hr></hr>

                <h2>강사</h2>

                <div>
                    <span>이름: {this.state.view_selected_lesson.instructorname}</span>
                </div>
                <hr></hr>
                <div>
                    <span>{datetimestr}</span>
                </div>

            </div> */}

            <LessonInfoComponent people={people} start_time={props.lesson.starttime} end_time={props.lesson.endtime}
                activity_type={props.lesson.activity_type}
            />
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={e => {
                console.log(this.state.view_selected_lesson)
                client.mutate({
                    mutation: DELETE_LESSON_GQL,
                    variables: {
                        lessonid: this.state.view_selected_lesson.id
                    }
                }).then(d => {
                    console.log(d)
                    if (d.data.delete_lesson.success) {

                        this.setState({
                            show_view_modal: false

                        }, () => {
                            this.fetchdata()
                        })
                    }
                    else {
                        alert('failed to delete lesson')
                    }
                }).catch(e => {
                    console.log('error deleting lesson')
                    alert('failed to delete lesson')
                })
            }}>delete</Button>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
    </Modal>
}