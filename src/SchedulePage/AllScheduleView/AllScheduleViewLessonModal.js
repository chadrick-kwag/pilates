import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap'

import React, { useState } from 'react'
import moment from 'moment'
import client from '../../apolloclient'

import {
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL

} from '../../common/gql_defs'

import LessonInfoComponent from '../LessonInfoComponent'

import PanelSequenceComponent, { PanelSequenceChild } from '../../components/PanelSequenceComponent'
import PersonProfileCard from '../../components/PersonProfileCard'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'
import { DatePicker, TimePicker } from '@material-ui/pickers'

export default function AllScheduleViewLessonModal(props) {

    console.log('AllScheduleViewLessonModal')
    console.log(props)


    const [editmode, setEditMode] = useState(false)


    const initlesson = {}
    Object.assign(initlesson, props.view_selected_lesson)
    initlesson.starttime = new Date(parseInt(initlesson.starttime))
    initlesson.endtime = new Date(parseInt(initlesson.endtime))
    const [editInfo, setEditInfo] = useState(initlesson)



    const delete_lesson_with_request_type = (request_type, ignore_warning = false) => {

        client.mutate({
            mutation: DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
            variables: {
                lessonid: props.view_selected_lesson.id,
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

                props.onDeleteSuccess()
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


    const change_lesson = () => {

        console.log(editInfo)

        let _var = {
            lessonid: parseInt(props.view_selected_lesson.id),
            start_time: editInfo.starttime.toUTCString(),
            end_time: editInfo.endtime.toUTCString(),
            instructor_id: editInfo.instructorid
        }

        console.log("mutate variables:")
        console.log(_var)

        // try to register lesson
        client.mutate({
            mutation: UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)

            if (d.data.update_lesson_instructor_or_time.success) {
                props.onEditSuccess?.()
            }
            else {
                alert(`failed to submit edit\n${d.data.update_lesson_instructor_or_time.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('error submitting edit')
        })



    }



    let people = [
        {
            type: 'client',
            name: props.view_selected_lesson.clientname,
            phonenumber: props.view_selected_lesson.client_phonenumber
        },
        {
            type: 'instructor',
            name: props.view_selected_lesson.instructorname,
            phonenumber: props.view_selected_lesson.instructor_phonenumber
        }
    ]




    return <div>
        <Modal show={true} onHide={() => props.onCancel()} dialogClassName='two-time-picker' >
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


            </PanelSequenceComponent> : <LessonInfoComponent people={people} start_time={props.view_selected_lesson.starttime}
                end_time={props.view_selected_lesson.endtime}
                activity_type={props.view_selected_lesson.activity_type}
                />}

            {editmode ? <Modal.Footer>
                <Button onClick={e => setEditMode(false)}>변경취소</Button>

            </Modal.Footer> : <Modal.Footer>
                    <Button onClick={e => setEditMode(true)}>
                        시간/강사변경
                </Button>
                    <DropdownButton drop='up' title='취소'>
                        <Dropdown.Item onClick={_ => {
                            delete_lesson_with_request_type('CLIENT_REQUEST')
                        }}>회원요청</Dropdown.Item>
                        <Dropdown.Item onClick={_ => delete_lesson_with_request_type('INSTRUCTOR_REQUEST')}>
                            강사요청
                    </Dropdown.Item>
                        <Dropdown.Item onClick={e => delete_lesson_with_request_type('ADMIN_REQUEST')}>
                            관리자</Dropdown.Item>
                    </DropdownButton>

                    <Button variant='danger' onClick={e => {
                        props.onCancel()
                    }}>닫기</Button>
                </Modal.Footer>}


        </Modal>

    </div>


}
