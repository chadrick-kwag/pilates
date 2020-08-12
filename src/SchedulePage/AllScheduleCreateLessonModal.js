import { Button, Modal } from 'react-bootstrap'
import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'

import React from 'react'
import moment from 'moment'

import {
    
    CREATE_LESSON_GQL
    
} from '../common/gql_defs'

class AllScheduleCreateLessonModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            create_selected_client: null,
            create_selected_instructor: null
        }

        this.create_input_check = this.create_input_check.bind(this)
        this.create_lesson = this.create_lesson.bind(this)
    }


    create_input_check() {
        if (this.state.create_selected_client == null) {
            return false
        }

        if (this.state.create_selected_instructor == null) {
            return false
        }

        return true
    }

    create_lesson() {
        let check_res = this.create_input_check()
        if (!check_res) {
            alert("inputs not valid")
            return
        }


        let starttime = this.props.start.toDate().toUTCString()
        let endtime = this.props.end.toDate().toUTCString()

        let _variables = {
            clientids: [parseInt(this.state.create_selected_client.id)],
            instructorid: parseInt(this.state.create_selected_instructor.id),
            starttime: starttime,
            endtime: endtime
        }


        this.props.apolloclient.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: _variables
        }).then(d => {
            console.log(d)
            if (d.data.create_lesson.success) {

                this.props.onCreateSuccess()
                // cb()
                // this.fetchdata()
            }
            else {
                console.log('failed to create lesson')
                alert('failed to create lesson')
            }

        }).catch(e => {
            console.log('error creating lesson')
            console.log(JSON.stringify(e))
            alert('failed to create lesson')
        })

    }



    render() {

        let datetimestr
        let date = this.props.start.toDate()
        let moment_date = moment(date)

        let end_date = this.props.end.toDate()
        let end_moment = moment(end_date)


        datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
        let endstr = end_moment.format("hh:mm A")

        datetimestr = datetimestr + endstr


        return <Modal show={true} onHide={() => this.props.onCancel()}>
            <Modal.Body>
                <ClientSearchComponent2 apolloclient={this.props.apolloclient} clientSelectedCallback={d => this.setState({
                    create_selected_client: d
                })} />

                <hr></hr>

                <InstructorSearchComponent2 apolloclient={this.props.apolloclient} instructorSelectedCallback={d => this.setState({
                    create_selected_instructor: d
                })} />

                <hr></hr>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>수업날짜: </span>
                    {datetimestr}
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e => {
                    this.props.onCancel()
                }}>
                    close
                </Button>
                <Button onClick={e => {
                    this.create_lesson()
                }}>OK</Button>
            </Modal.Footer>

        </Modal>

    }
}

export default AllScheduleCreateLessonModal