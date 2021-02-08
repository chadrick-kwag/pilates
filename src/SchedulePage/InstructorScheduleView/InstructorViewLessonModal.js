import React from 'react'

import { Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap'
import client from '../../apolloclient'
import {
    DELETE_LESSON_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL
} from '../../common/gql_defs'
import LessonInfoComponent from '../LessonInfoComponent'
import moment from 'moment'


export default function InstructorViewLessonModal(props) {


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

    const try_lesson_delete = (_ignore_warning=false, req_type) => {
        client.mutate({
            mutation: DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
            variables: {
                lessonid: props.lesson.id,
                ignore_warning: _ignore_warning,
                request_type: req_type

            }
        }).then(d => {
            console.log(d)
            if (d.data.delete_lesson_with_request_type.success) {
                props.onDeleteSuccess()
            }
            else if(d.data.delete_lesson_with_request_type.penalty_warning === true && _ignore_warning===false){
                let ask = confirm('deleting will cause penalty. proceed?')
                if(ask){
                    try_lesson_delete(true, req_type)
                }
            }
            else {
                alert('failed to delete lesson')
            }
        }).catch(e => {
            console.log('error deleting lesson')
            alert('failed to delete lesson')
        })
    }


    return <Modal show={props.show} onHide={props.onHide}>
        <Modal.Body>

            <LessonInfoComponent people={people} start_time={props.lesson.starttime} end_time={props.lesson.endtime}
                activity_type={props.lesson.activity_type}
            />
        </Modal.Body>
        <Modal.Footer>
            
            <DropdownButton drop='up' title='취소'>
                <Dropdown.Item onClick={_=>{
                    try_lesson_delete(false, 'INSTRUCTOR_REQUEST')
                }}>강사요청 취소</Dropdown.Item>
                <Dropdown.Item onClick={e=>{
                    try_lesson_delete(false, 'ADMIN_REQUEST')
                }}>관리자 취소</Dropdown.Item>
            </DropdownButton>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
    </Modal>
}