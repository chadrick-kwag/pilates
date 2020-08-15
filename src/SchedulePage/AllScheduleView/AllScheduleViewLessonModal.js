import { Button, Modal } from 'react-bootstrap'
import ClientSearchComponent2 from '../../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'

import React from 'react'
import moment from 'moment'

import {

    DELETE_LESSON_GQL

} from '../../common/gql_defs'

class AllScheduleViewLessonModal extends React.Component {

    constructor(props) {
        super(props)

        this.delete_lesson = this.delete_lesson.bind(this)
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



    render() {

        let datetimestr
        console.log("view_selected_lesson")
        console.log(this.props.view_selected_lesson)
        
        let moment_date = moment(new Date(parseInt(this.props.view_selected_lesson.starttime)))

        
        let end_moment = moment(new Date(parseInt(this.props.view_selected_lesson.endtime)))


        datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
        let endstr = end_moment.format("hh:mm A")

        datetimestr = datetimestr + endstr


        return <Modal show={true} onHide={() => this.props.onCancel()}>
            <Modal.Body>
                <div>
                    <h2>회원</h2>
                    <div>
                        <span>이름: {this.props.view_selected_lesson.clientname}</span>

                    </div>
                    <hr></hr>

                    <h2>강사</h2>

                    <div>
                        <span>이름: {this.props.view_selected_lesson.instructorname}</span>
                    </div>
                    <hr></hr>
                    <div>
                        <span>{datetimestr}</span>
                    </div>

                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e => {
                    this.delete_lesson()
                }}>delete</Button>
                <Button onClick={e => {
                    this.props.onCancel()
                }
                }>Close</Button>
            </Modal.Footer>
        </Modal>

    }
}

export default AllScheduleViewLessonModal