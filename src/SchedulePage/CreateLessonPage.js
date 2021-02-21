import React from 'react'


import GroupingTypeSelectComponent from '../components/GroupingTypeSelectComponent'
import ActivityTypeSelectComponent from '../components/ActivityTypeSelectComponent'


import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'

import { Button } from 'react-bootstrap'



import { DatePicker, TimePicker } from '@material-ui/pickers'


import { CREATE_LESSON_GQL } from '../common/gql_defs'


import client from '../apolloclient'
import ClientTicketSelectComponent from '../components/clientTicketSelectComponent'


const zero_out_less_than_hours = (d) => {
    let output = new Date(d)
    output.setMinutes(0)
    output.setSeconds(0)
    output.setMilliseconds(0)

    return output
}


const zero_out_less_than_minutes = (d) => {
    let output = new Date(d)

    output.setSeconds(0)
    output.setMilliseconds(0)

    return output
}

class CreateLessonPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            selected_activity_type: null,
            selected_grouping_type: null,
            selected_client: null,
            selected_subscription_ticket: null,
            selected_instructor: null,
            selected_ticketinfo_arr: [],
            selected_date: new Date(),
            start_time: zero_out_less_than_hours(new Date()),
            end_time: zero_out_less_than_hours(new Date())
        }

        this.checkinput = this.checkinput.bind(this)
        this.createlesson = this.createlesson.bind(this)
        this.calc_client_slot_size = this.calc_client_slot_size.bind(this)
    }



    checkinput() {

        if (this.state.selected_activity_type === null) {
            return 'no selected activity type'
        }

        if (this.state.selected_grouping_type === null) {
            return 'no selected grouping type'
        }


        if (this.state.selected_instructor === null) {
            console.log('no selected instructor')
            return 'no selected instructor'
        }

        if (this.state.start_time === null || this.state.end_time === null) {
            console.log('null start/end time')
            return 'null start /end time'
        }

        if (this.state.selected_date === null) {
            console.log('selected date is null')
            return 'selected date is null'
        }

        if (this.state.selected_ticketinfo_arr.length === 0 || !this.state.selected_ticketinfo_arr.length) {

            return 'no tickets selected'
        }

        if (this.state.selected_grouping_type.toLowerCase() === 'semi' && this.state.selected_ticketinfo_arr.length !== 2) {
            return 'incorrect client num for semi'
        }

        if (this.state.selected_grouping_type.toLowerCase() === 'group' && this.state.selected_ticketinfo_arr.length < 2) {
            return 'not enough clients for group'
        }

        if (this.state.selected_grouping_type.toLowerCase() === 'individual' && this.state.selected_ticketinfo_arr.length !== 1) {
            return 'not one client for individual type'
        }

        // check start/end time

        let start_datetime = new Date(this.state.selected_date)

        let start_hour = this.state.start_time.getHours()
        let start_min = this.state.start_time.getMinutes()

        start_datetime.setHours(start_hour)
        start_datetime.setMinutes(start_min)
        start_datetime = zero_out_less_than_minutes(start_datetime)


        let end_datetime = new Date(this.state.selected_date)
        let end_hour = this.state.end_time.getHours()
        let end_min = this.state.end_time.getMinutes()
        end_datetime.setHours(end_hour)
        end_datetime.setMinutes(end_min)
        end_datetime = zero_out_less_than_minutes(end_datetime)

        if (start_datetime >= end_datetime) {
            return 'time end start wrong'
        }

        return null
    }

    createlesson() {

        let ret = this.checkinput()

        if (ret != null) {
            console.log('check input failed')
            alert('input invalid\n' + ret)
            return
        }

        console.log('inside create lesson')
        console.log(this.state)


        let start_datetime = new Date(this.state.selected_date)

        let start_hour = this.state.start_time.getHours()
        let start_min = this.state.start_time.getMinutes()

        start_datetime.setHours(start_hour)
        start_datetime.setMinutes(start_min)
        start_datetime = zero_out_less_than_minutes(start_datetime)


        let end_datetime = new Date(this.state.selected_date)
        let end_hour = this.state.end_time.getHours()
        let end_min = this.state.end_time.getMinutes()
        end_datetime.setHours(end_hour)
        end_datetime.setMinutes(end_min)
        end_datetime = zero_out_less_than_minutes(end_datetime)

        console.log('selected ticketinfo arr')
        console.log(this.state.selected_ticketinfo_arr)

        let vars = {
            ticketids: this.state.selected_ticketinfo_arr.map(d => d.ticketid),
            instructorid: parseInt(this.state.selected_instructor.id),
            starttime: start_datetime.toUTCString(),
            endtime: end_datetime.toUTCString()

        }

        console.log('sending vars:')
        console.log(vars)

        client.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: vars
        }).then(d => {
            console.log(d)
            if (d.data.create_lesson.success) {
                console.log('success creating lesson')
                this.props.onCreateSuccess?.()

            }
            else {

                console.log('failed to create lesson')
                alert(`failed to create lesson\n${d.data.create_lesson.msg}`)
            }




        }).catch(e => {
            console.log('error creating lesson')
            console.log(JSON.stringify(e))
            alert('error creating lesson')
        })
    }


    calc_client_slot_size() {
        let size = 0

        if (!this.state.selected_grouping_type) {
            return size
        }

        let grouping_type = this.state.selected_grouping_type.toLowerCase()
        if (grouping_type === 'individual') {
            return 1
        }
        else if (grouping_type === 'semi') {
            return 2
        }
        else if (grouping_type === 'group') {
            return 50
        }
        else {
            console.log('invalid grouping type')

        }

        return size

    }

    render() {


        return <div className="col-gravity-center">

            <div className="padded-block col-gravity-center">
                <ActivityTypeSelectComponent onItemClicked={d => {
                    if (this.state.selected_activity_type !== d) {
                        this.setState({
                            selected_activity_type: d,
                            selected_ticketinfo_arr: []
                        })
                    }
                    else {
                        this.setState({
                            selected_activity_type: d
                        })
                    }
                }} />
            </div>


            <div className="padded-block col-gravity-center">
                <GroupingTypeSelectComponent onItemClicked={d => {
                    if (this.state.selected_grouping_type !== d) {
                        this.setState({
                            selected_grouping_type: d,
                            selected_ticketinfo_arr: []
                        })
                    }
                    else {
                        this.setState({
                            selected_grouping_type: d
                        })
                    }

                }} />
            </div>



            <div className="padded-block col-gravity-center" style={{
                position: 'relative',
                left: '0px',
                top: '0px'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    zIndex: '100',
                    display: this.state.selected_activity_type !== null && this.state.selected_grouping_type !== null ? 'none' : 'inline'
                }}></div>
                <h3>회원선택</h3>

                {/* <ClientSearchComponent2 clientSelectedCallback={c => this.setState({
                    selected_client: c
                })} /> */}

                <ClientTicketSelectComponent maxItemSize={this.calc_client_slot_size()} ticket_info_arr={this.state.selected_ticketinfo_arr} activity_type={this.state.selected_activity_type}
                    grouping_type={this.state.selected_grouping_type}
                    onTicketSelectSuccess={d => {

                        let duplicate_check = false;


                        for (let i = 0; i < this.state.selected_ticketinfo_arr.length; i++) {

                            if (this.state.selected_ticketinfo_arr[i].clientid === d.clientid) {
                                duplicate_check = true
                                break
                            }
                        }


                        if (duplicate_check) {
                            alert('cannot add more than one ticket for one client')
                        }
                        else {
                            let new_ticket_list = this.state.selected_ticketinfo_arr.concat(d)
                            this.setState({
                                selected_ticketinfo_arr: new_ticket_list
                            })
                        }


                    }}

                    removeTicketByIndex={(i) => {
                        let new_ticket_list = [...this.state.selected_ticketinfo_arr]

                        new_ticket_list.splice(i, 1)

                        this.setState({
                            selected_ticketinfo_arr: new_ticket_list
                        })
                    }}

                />

            </div>




            <div className="padded-block col-gravity-center">
                <h3>강사선택</h3>

                <InstructorSearchComponent2 instructorSelectedCallback={i => {
                    console.log(i)
                    this.setState({
                        selected_instructor: i
                    })
                }} />

            </div>

            <div className="padded-block col-gravity-center">
                <h2>수업시간선택</h2>



                <DatePicker
                    autoOk
                    orientation="landscape"
                    variant="static"
                    openTo="date"
                    value={this.state.selected_date}
                    onChange={d => {
                        console.log(d)
                        this.setState({
                            selected_date: d
                        })
                    }}
                />



                <div className="small-margined row-gravity-center">


                    <div className='col-gravity-center'>
                        <h3>시작</h3>
                        <TimePicker
                            autoOk
                            ampm={false}
                            variant="static"
                            orientation="portrait"
                            openTo="hours"
                            minutesStep="5"
                            value={this.state.start_time}
                            onChange={d => {
                                console.log(d)
                                this.setState({
                                    start_time: d
                                })
                            }}
                        />

                    </div>


                    <div className='col-gravity-center'>
                        <h3>종료</h3>
                        <TimePicker
                            autoOk
                            ampm={false}
                            variant="static"
                            orientation="portrait"
                            openTo="hours"
                            minutesStep="5"
                            value={this.state.end_time}
                            onChange={d => {
                                console.log(d)
                                this.setState({
                                    end_time: d
                                })
                            }}
                        />

                    </div>


                </div>

            </div>

            <div className='footer'>
                <Button onClick={e => this.props.cancel_callback()}>취소</Button>
                <Button onClick={e => this.createlesson()}>생성</Button>
            </div>
        </div>
    }
}

export default CreateLessonPage