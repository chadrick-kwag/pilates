import React, { useState } from 'react'

import { Modal, DropdownButton, Dropdown, Button } from 'react-bootstrap'
import {
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL
} from '../../common/gql_defs'
import client from '../../apolloclient'
import LessonInfoComponent from '../LessonInfoComponent'
import PersonProfileCard from '../../components/PersonProfileCard'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'
import moment from 'moment'
import { DatePicker, TimePicker } from '@material-ui/pickers'
import PanelSequenceComponent from '../../components/PanelSequenceComponent'


export default function ClientViewLessonModal(props) {


    const [editmode, setEditMode] = useState(false)

    const initlesson = {}
    Object.assign(initlesson, props.lesson)
    initlesson.starttime = new Date(parseInt(initlesson.starttime))
    initlesson.endtime = new Date(parseInt(initlesson.endtime))
    const [editInfo, setEditInfo] = useState(initlesson)


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
                props.onDeleteSuccess?.()
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


    // 변경화면: 강사->날짜->시작,종료시간->완성
    return <Modal dialogClassName='two-time-picker' show={props.show} onHide={props.onHide}>
        <Modal.Body>

            {editmode === true ? <div>


                <PanelSequenceComponent>
                    <div className='col-gravity-center' >
                        <PersonProfileCard type='강사' name={editInfo.instructorname} phonenumber={editInfo.instructor_phonenumber} />
                        <InstructorSearchComponent2 instructorSelectedCallback={d => {
                            let newinfo = {}
                            Object.assign(newinfo, editInfo)

                            newinfo.instructor_phonenumber = d.phonenumber
                            newinfo.instructorname = d.name
                            newinfo.instructorid = d.id

                            setEditInfo(newinfo)

                        }} />
                    </div>

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

                    <div>
                        <div className='row-gravity-center'><h2>{moment(editInfo.lesson_date).format('YYYY.MM.DD')}</h2></div>
                        <div className='row-gravity-center two-time-picker-parent'>
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


                </PanelSequenceComponent>
            </div> : <LessonInfoComponent people={people} start_time={props.lesson.starttime} end_time={props.lesson.endtime}
                activity_type={props.lesson.activity_type}
                />}


        </Modal.Body>
        {editmode === true ? <Modal.Footer>
            <Button onClick={_ => {
                setEditMode(false)
                setEditInfo(props.lesson)
            }}>변경취소</Button>
        </Modal.Footer> : <Modal.Footer>

                <Button onClick={_ => setEditMode(true)}>
                    시간강사변경
            </Button>
                <DropdownButton drop='up' title='취소'>
                    <Dropdown.Item onClick={_ => {
                        try_lesson_delete(false, 'CLIENT_REQUEST')
                    }}>회원요청 취소</Dropdown.Item>
                    <Dropdown.Item onClick={e => {
                        try_lesson_delete(false, 'ADMIN_REQUEST')
                    }}>관리자 취소</Dropdown.Item>
                </DropdownButton>
                <Button variant='danger' onClick={props.onHide}>닫기</Button>
            </Modal.Footer>}

    </Modal>
}