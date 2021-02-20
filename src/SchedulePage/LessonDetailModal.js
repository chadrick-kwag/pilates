import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap'

import React, { useState } from 'react'
import moment from 'moment'
import client from '../apolloclient'

import {
    CANCEL_INDIVIDUAL_LESSON,
    UPDATE_LESSON_INSTRUCTOR_OR_TIME_GQL,
    DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
    CHANGE_CLIENTS_OF_LESSON

} from '../common/gql_defs'

import LessonInfoComponent from './LessonInfoComponent'

import PanelSequenceComponent, { PanelSequenceChild } from '../components/PanelSequenceComponent'
import PersonProfileCard from '../components/PersonProfileCard'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'
import { DatePicker, TimePicker } from '@material-ui/pickers'
import ClientTicketSelectComponent from '../components/clientTicketSelectComponent'



const EDITMODE = {
    NONE: 'NONE',
    TIME_INSTRUCTOR_CHANGE: 'TIME_INSTRUCTOR_CHANGE',
    CLIENT_CHANGE: 'CLIENT_CHANGE'
}

export default function LessonDetailModal(props) {

    console.log('inside LessonDetailModal')
    console.log(props)

    const [editmode, setEditMode] = useState(EDITMODE.NONE)



    const initlesson = _.cloneDeep(props.view_selected_lesson)


    initlesson.starttime = new Date(parseInt(initlesson.starttime))
    initlesson.endtime = new Date(parseInt(initlesson.endtime))

    const [editInfo, setEditInfo] = useState(initlesson)


    const individual_lesson_client_req_cancel = () => {

        let _var = {
            ticketid_arr: [],
            lessonid: editInfo.id
        }


        client.mutate({
            mutation: CHANGE_CLIENTS_OF_LESSON,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.change_clients_of_lesson.success) {
                console.log('success')
                props.onEditSuccess?.()
            }
            else {
                console.log('fail')
                alert('change fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('change error')
        })
    }

    const submit_client_change = () => {

        console.log(editInfo)

        let _var = {
            ticketid_arr: editInfo.client_info_arr.map(d => d.ticketid),
            lessonid: editInfo.id
        }

        console.log('_var')
        console.log(_var)

        client.mutate({
            mutation: CHANGE_CLIENTS_OF_LESSON,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.change_clients_of_lesson.success) {
                console.log('success')
                props.onEditSuccess?.()
            }
            else {
                console.log('fail')
                alert('change fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('change error')
        })
    }

    const check_change_clients_submit_possible = () => {

        // check if ticket ids in edit info and props.view_selected_lesson are identical
        // if identical, then submit not allowed
        // first check length of two
        if (editInfo.client_info_arr.length !== props.view_selected_lesson.client_info_arr.length) {
            return true;
        }

        console.log(editInfo.client_info_arr)

        let edit_client_id_set = new Set(editInfo.client_info_arr.map(d => d.clientid))
        let prop_client_id_set = new Set(props.view_selected_lesson.client_info_arr.map(d => d.clientid))

        let diff_set = new Set([...edit_client_id_set].filter(x => !prop_client_id_set.has(x)))
        if (diff_set.size > 0) {
            // different ticket id exists
            return true;
        }

        return false
    }

    const delete_lesson_with_request_type = (request_type, ignore_warning = false) => {


        // if lesson is individual grouping type, then use CANCEL_INDIVIDUAL_LESSON

        console.log(props.view_selected_lesson)


        // for non individual types


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

    let people = props.view_selected_lesson.client_info_arr.map(a => {
        return {
            type: 'client',
            name: a.clientname,
            phonenumber: a.clientphonenumber
        }
    })

    people.push({
        type: 'instructor',
        name: props.view_selected_lesson.instructorname,
        phonenumber: props.view_selected_lesson.instructorphonenumber
    })

    console.log('editInfo')
    console.log(editInfo)

    return <div>
        <Modal show={true} onHide={() => props.onCancel()} dialogClassName='two-time-picker' >
            {editmode === EDITMODE.TIME_INSTRUCTOR_CHANGE ? <PanelSequenceComponent >
                <PanelSequenceChild prevBtnHide={true}>
                    <div className='col-gravity-center' >
                        <PersonProfileCard type='강사' name={editInfo.instructorname} phonenumber={editInfo.instructor_phonenumber} />
                        <InstructorSearchComponent2 instructorSelectedCallback={d => {
                            console.log(d)
                            let newinfo = _.cloneDeep(editInfo)
                            // Object.assign(newinfo, editInfo)

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
                            value={editInfo.starttime}
                            onChange={d => {
                                console.log(d)
                                // copy year, month, day info to starttime and endtime
                                let year = d.getFullYear()
                                let month = d.getMonth()
                                let date = d.getDate()

                                let newinfo = _.cloneDeep(editInfo)
                                // let newinfo = {}
                                // Object.assign(newinfo, editInfo)

                                newinfo.starttime.setFullYear(year)
                                newinfo.starttime.setMonth(month)
                                newinfo.starttime.setDate(date)

                                newinfo.endtime.setFullYear(year)
                                newinfo.endtime.setMonth(month)
                                newinfo.endtime.setDate(date)


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
                                    let newinfo = _.cloneDeep(editInfo)
                                    // let newinfo = {}
                                    // Object.assign(newinfo, editInfo)
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
                                    let newinfo = _.cloneDeep(editInfo)
                                    // let newinfo = {}
                                    // Object.assign(newinfo, editInfo)
                                    newinfo.endtime = d
                                    setEditInfo(newinfo)
                                }}
                            />
                        </div>
                    </div>
                </PanelSequenceChild>


            </PanelSequenceComponent> : null}

            {editmode === EDITMODE.NONE ? <LessonInfoComponent people={people} start_time={props.view_selected_lesson.starttime}
                end_time={props.view_selected_lesson.endtime}
                activity_type={props.view_selected_lesson.activity_type}
            /> : null}

            {editmode === EDITMODE.CLIENT_CHANGE ? <div>
                <ClientTicketSelectComponent activity_type={props.view_selected_lesson.activity_type} grouping_type={props.view_selected_lesson.grouping_type}
                    ticket_info_arr={editInfo.client_info_arr.map(d => {
                        return {
                            name: d.clientname,
                            phonenumber: d.clientphonenumber,
                            id: d.ticketid
                        }
                    })}
                    maxItemSize={props.view_selected_lesson.grouping_type.toLowerCase() === 'semi' ? 2 : props.view_selected_lesson.grouping_type.toLowerCase() === 'group' ? 10 : 0}

                    onTicketSelectSuccess={d => {
                        let new_editinfo = _.cloneDeep(editInfo)

                        new_editinfo.client_info_arr.push({
                            clientname: d.name,
                            clientphonenumber: d.phonenumber,
                            ticketid: d.ticketid,
                            clientid: parseInt(d.clientid)
                        })
                        setEditInfo(new_editinfo)
                    }}

                    removeTicketByIndex={i => {
                        console.log('inside removeTicketByIndex')
                        console.log(editInfo)
                        let client_info_arr = _.cloneDeep(editInfo.client_info_arr)

                        console.log('client_info_arr')
                        console.log(client_info_arr)

                        client_info_arr.splice(i, 1)

                        let new_editinfo = _.cloneDeep(editInfo)
                        new_editinfo.client_info_arr = client_info_arr

                        setEditInfo(new_editinfo)
                    }}

                />
            </div> : null}

            {editmode !== EDITMODE.NONE ?

                editmode === EDITMODE.CLIENT_CHANGE ?
                    <Modal.Footer>
                        <Button disabled={!check_change_clients_submit_possible()} onClick={e => submit_client_change()}>변경요청</Button>
                        <Button variant='warning' onClick={e => {
                            setEditInfo(initlesson)
                            setEditMode(EDITMODE.NONE)
                        }}>변경취소</Button>

                    </Modal.Footer> :
                    null :
                <Modal.Footer>
                    <Button onClick={e => setEditMode(EDITMODE.TIME_INSTRUCTOR_CHANGE)}>
                        시간/강사변경
                </Button>

                    {/* if grouping is not individual, and there is more than one clients, then disable cancel button
            instad show 수강회원변경 to allow controlling client number
            */}

                    {props.view_selected_lesson.grouping_type !== 'INDIVIDUAL' ? <Button onClick={e => setEditMode(EDITMODE.CLIENT_CHANGE)} >수강생변경</Button> : null}


                    <DropdownButton drop='up' title='취소'>
                        {props.cancel_options.includes('client_req') && props.view_selected_lesson.grouping_type === 'INDIVIDUAL' ? <Dropdown.Item onClick={_ => {
                            individual_lesson_client_req_cancel()
                        }}>회원요청</Dropdown.Item> : null}
                        {props.cancel_options.includes('instructor_req') ? <Dropdown.Item onClick={_ => delete_lesson_with_request_type('instructor_req')}>
                            강사요청
                        </Dropdown.Item> : null}
                        {props.cancel_options.includes('admin_req') ? <Dropdown.Item onClick={e => delete_lesson_with_request_type('admin_req')}>
                            관리자</Dropdown.Item> : null}

                    </DropdownButton>



                    <Button variant='danger' onClick={e => {
                        props.onCancel?.()
                    }}>닫기</Button>
                </Modal.Footer>}


        </Modal>

    </div>


}


LessonDetailModal.defaultProps = {
    cancel_options: ['client_req', 'instructor_req', 'admin_req'],
    openTimeInstructorChange: true
}