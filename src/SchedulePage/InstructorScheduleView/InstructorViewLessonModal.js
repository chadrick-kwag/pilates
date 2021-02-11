import React, { useState } from 'react'

import { Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap'
import client from '../../apolloclient'
import {
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL
} from '../../common/gql_defs'
import LessonInfoComponent from '../LessonInfoComponent'
import moment from 'moment'
import PanelSequenceComponent, { PanelSequenceChild } from '../../components/PanelSequenceComponent'
import PersonProfileCard from '../../components/PersonProfileCard'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'
import { DatePicker, TimePicker } from '@material-ui/pickers'


export default function InstructorViewLessonModal(props) {

    const [editmode, setEditMode] = useState(false)

    const initlesson = {}
    Object.assign(initlesson, props.lesson)
    initlesson.starttime = new Date(parseInt(initlesson.starttime))
    initlesson.endtime = new Date(parseInt(initlesson.endtime))

    const [editInfo, setEditInfo] = useState(initlesson)


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

    const try_lesson_delete = (_ignore_warning = false, req_type) => {
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
            else if (d.data.delete_lesson_with_request_type.penalty_warning === true && _ignore_warning === false) {
                let ask = confirm('deleting will cause penalty. proceed?')
                if (ask) {
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


    const change_lesson = () => {
        // 강사가 변경되면, 무조건 기존 레슨 취소하고 새로운 레슨 만들어야 함.
        // 시간만 변경되면, 기존 레슨 취소 없이, 기존 레슨 시간만 체크하고 변경해야함
        // 강사, 시간 둘다 변경되는 거면, 1) 변경후 강사가 변경후 시간에 되는지를 체크하고 나서, 2) 기존 레슨 취소하고 3) 새로운 레슨 생성 해야됨.
        // 아마 위 로직들은 백엔드에서 체크 후 가능여부를 알려줘야함
        // 그러니까 여기서는 gql 쿼리 하나 잡고 일단 보내보는 걸로 처리.
        client.mutate({
            mutation: UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
            //$lessonid: Int!, $start_time: String!, $end_time: String!, $instructor_id: Int!
            variables: {
                lessonid: editInfo.id,
                start_time: editInfo.starttime.toUTCString(),
                end_time: editInfo.endtime.toUTCString(),
                instructor_id: editInfo.instructorid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {

            console.log(res.data)

            if (res.data.update_lesson_instructor_or_time.success) {
                console.log('change lesson success')
                props.onEditSuccess?.()
            }
            else {
                alert('change lesson failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('change lesson error')
        })

    }


    return <Modal show={props.show} onHide={props.onHide} dialogClassName='two-time-picker'>
        <Modal.Body>
            {editmode ? <PanelSequenceComponent >
                <PanelSequenceChild prevBtnHide={true}>
                    <div className='col-gravity-center' >
                        <PersonProfileCard type='강사' name={editInfo.instructorname} phonenumber={editInfo.instructor_phonenumber} />
                        <InstructorSearchComponent2 instructorSelectedCallback={d => {
                            console.log(d)
                            let newinfo = {}
                            Object.assign(newinfo, editInfo)

                            newinfo.instructor_phonenumber = d.phonenumber
                            newinfo.instructorname = d.name
                            newinfo.instructorid = parseInt(d.id)

                            setEditInfo(newinfo)

                        }} />
                    </div>
                </PanelSequenceChild>

                <PanelSequenceChild>
                    <div className='col-gravity-center' >

                        <DatePicker
                            autoOk
                            orientation="landscape"
                            variant="static"
                            openTo="date"
                            value={editInfo.lesson_date}
                            onChange={d => {
                                console.log(d)
                                let newinfo = {}
                                Object.assign(newinfo, editInfo)
                                newinfo.lesson_date = d
                                setEditInfo(newinfo)
                            }}

                        />
                    </div>
                </PanelSequenceChild>

                <PanelSequenceChild nextBtnClick={() => {
                    console.log('final page clicked')
                    console.log(editInfo)

                    // attempt to update lesosn with editInfo
                    change_lesson()

                }} nextBtnText='submit'>
                    <div>
                        <div className='row-gravity-center'><h2>{moment(editInfo.lesson_date).format('YYYY.MM.DD')}</h2></div>
                        <div className='row-gravity-center'>
                            <TimePicker size='small'
                                autoOk
                                ampm={false}
                                variant="static"
                                orientation="portrait"
                                openTo="hours"

                                value={editInfo.starttime}
                                onChange={d => {
                                    console.log(d)
                                    let newinfo = {}
                                    Object.assign(newinfo, editInfo)
                                    newinfo.starttime = d
                                    setEditInfo(newinfo)
                                }}
                            />

                            <TimePicker
                                autoOk
                                ampm={false}
                                variant="static"
                                orientation="portrait"
                                openTo="hours"

                                value={editInfo.endtime}
                                onChange={d => {
                                    console.log(d)
                                    let newinfo = {}
                                    Object.assign(newinfo, editInfo)
                                    newinfo.endtime = d
                                    setEditInfo(newinfo)
                                }}
                            />
                        </div>
                    </div>
                </PanelSequenceChild>


            </PanelSequenceComponent> : <LessonInfoComponent people={people} start_time={props.lesson.starttime} end_time={props.lesson.endtime}
                activity_type={props.lesson.activity_type}
                />}

        </Modal.Body>

        {editmode === true ? <Modal.Footer>
            <Button onClick={_ => {
                setEditMode(false)
                setEditInfo(initlesson)
            }}>변경취소</Button>
        </Modal.Footer> : <Modal.Footer>
                <Button onClick={_ => {
                    setEditMode(true)
                }}>
                    시간강사변경
            </Button>
                <DropdownButton drop='up' title='취소'>
                    <Dropdown.Item onClick={_ => {
                        try_lesson_delete(false, 'INSTRUCTOR_REQUEST')
                    }}>강사요청 취소</Dropdown.Item>
                    <Dropdown.Item onClick={e => {
                        try_lesson_delete(false, 'ADMIN_REQUEST')
                    }}>관리자 취소</Dropdown.Item>
                </DropdownButton>
                <Button variant='danger' onClick={props.onHide}>닫기</Button>
            </Modal.Footer>}

    </Modal>
}