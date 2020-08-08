import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { gql } from '@apollo/client'


import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

import ClientSearchComponent from '../components/ClientSearchComponent'
import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import InstructorSearchComponent from '../components/InstructorSearchComponent'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'
import moment from 'moment'

import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

const today = new Date()


const FETCH_LESSON_GQL = gql`query {
    query_all_lessons{
        id,
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
    }
}`


const CREATE_LESSON_GQL = gql`mutation createlesson($clientids:[Int!], $instructorid:Int!, $starttime: String!, $endtime:String!){
    create_lesson(clientids: $clientids, instructorid: $instructorid, start_time: $starttime, end_time: $endtime){
        success
    }
}`


const DELETE_LESSON_GQL = gql`mutation deletelesson($lessonid:Int!){
    delete_lesson(lessonid:$lessonid){
        success
    }
}`

class ScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [],
            show_create_modal: false,
            modal_info: null,
            show_view_modal: false,
            create_selected_client: null,
            create_selected_instructor: null,


            view_selected_lesson: null,
            view_date: new Date(),
            show_date_picker: false

        }

        // this.createlesson = this.createlesson.bind(this)
        this.fetchdata = this.fetchdata.bind(this)
        this.create_lesson = this.create_lesson.bind(this)
        this.create_input_check = this.create_input_check.bind(this)
    }


    fetchdata() {
        this.props.apolloclient.query({
            query: FETCH_LESSON_GQL,
            fetchPolicy: 'network-only'
        }).then(res => {
            console.log('fetch data result')
            console.log(res)

            if (res.data.query_all_lessons) {
                console.log("success fetching lesson data")
                console.log("init data")
                console.log(res.data.query_all_lessons)
                this.setState({
                    data: res.data.query_all_lessons
                })

                return

            }
            console.log("failed to fetch data")
        }).catch(e => {
            console.log("error fetching lesson data")
        })
    }

    componentDidMount() {
        this.fetchdata()
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


    create_lesson(cb) {

        let starttime = this.state.modal_info.schedule.start.toDate().toUTCString()
        let endtime = this.state.modal_info.schedule.end.toDate().toUTCString()

        let _variables = {
            clientids: [parseInt(this.state.create_selected_client.id)],
            instructorid: parseInt(this.state.create_selected_instructor.id),
            starttime: starttime,
            endtime: endtime
        }

        console.log("_variables")
        console.log(_variables)

        this.props.apolloclient.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: _variables
        }).then(d => {
            console.log(d)
            if (d.data.create_lesson.success) {
                cb()
                this.fetchdata()
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

        console.log("inside render")

        let schedule_formatted_data = this.state.data.map((d, i) => {

            let starttime = d.starttime
            let endtime = d.endtime


            starttime = new Date(parseInt(starttime))
            endtime = new Date(parseInt(endtime))



            let clientid = d.clientid
            let instructorid = d.instructorid

            let title = d.clientname + " 회원님 / " + d.instructorname + " 강사님"
            console.log(i)
            return {
                id: parseInt(i),
                calendarId: '0',
                title: title,
                category: 'time',
                dueDateClass: '',
                start: starttime,
                end: endtime
            }
        })



        let datetimestr
        try {
            console.log(this.state.modal_info.schedule.start.toString())
            let date = this.state.modal_info.schedule.start.toDate()
            let moment_date = moment(date)

            let end_date = this.state.modal_info.schedule.end.toDate()
            let end_moment = moment(end_date)


            datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
            let endstr = end_moment.format("hh:mm A")

            datetimestr = datetimestr + endstr

        }
        catch (err) {
            console.log('failed to create schedule start string')
            console.log(err)
            datetimestr = null
        }







        let view_modal

        if (this.state.show_view_modal) {



            view_modal = <Modal show={this.state.show_view_modal} onHide={() => this.setState({
                show_view_modal: false
            })}>
                <Modal.Body>
                    <div>
                        <h2>회원</h2>
                        <div>
                            <span>이름: {this.state.view_selected_lesson.clientname}</span>

                        </div>
                        <h2>강사</h2>
                        <div><span>이름: {this.state.view_selected_lesson.instructorname}</span></div>

                        <div>
                            <span>{datetimestr}</span>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={e => {
                        console.log(this.state.view_selected_lesson)
                        this.props.apolloclient.mutate({
                            mutation: DELETE_LESSON_GQL,
                            variables: {
                                lessonid: this.state.view_selected_lesson.id
                            }
                        }).then(d => {
                            console.log(d)
                            if (d.data.delete_lesson.success) {
                                this.fetchdata()
                                this.setState({
                                    show_view_modal: false

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
                    <Button onClick={e => {
                        this.setState({
                            show_view_modal: false
                        })
                    }
                    }>Close</Button>
                </Modal.Footer>
            </Modal>
        }
        else {
            view_modal = null
        }


        // date picker div

        let date_picker_element = null
        if (this.state.show_date_picker) {
            console.log(this.datebutton)
            console.log(this.datebutton.getBoundingClientRect())
            let bbox = this.datebutton.getBoundingClientRect()

            let left_offset = bbox.left + bbox.width / 2
            let top_offset = bbox.top + bbox.height / 2

            console.log(left_offset)
            console.log(top_offset)

            date_picker_element = <div style={{
                position: "absolute", top: top_offset + "px", left: left_offset + "px",
                backgroundColor: "white",
                zIndex: "200"
            }}> <DayPicker
                    selectedDays={this.state.view_date}
                    onDayClick={(d, m, e) => {
                        console.log(d)
                        console.log("picked")
                        this.calendar.calendarInst.setDate(d)
                        this.setState({
                            view_date: d,
                            show_date_picker: false
                        })
                    }} /> </div>
        }

        return <div>

            <Modal show={this.state.show_create_modal} onHide={() => this.setState({
                show_create_modal: false
            })}>
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
                        this.setState({
                            show_create_modal: false
                        })
                    }}>
                        close
                    </Button>
                    <Button onClick={e => {

                        let check_res = this.create_input_check()
                        if (!check_res) {
                            alert("inputs not valid")
                            return
                        }

                        this.create_lesson(() => {
                            // do stuff
                            this.setState({
                                show_create_modal: false
                            })
                        })




                    }}>OK</Button>
                </Modal.Footer>

            </Modal>

            {view_modal}

            <div>
                <Button onClick={e => {
                    this.calendar.calendarInst.prev()
                    // update current view date
                    let new_date = new Date(this.state.view_date)
                    new_date.setDate(this.state.view_date.getDate() - 7)
                    console.log(new_date)
                    this.setState({
                        view_date: new_date
                    })
                }}>prev week</Button>
                <Button ref={r => this.datebutton = r} onClick={e => {
                    this.setState({
                        show_date_picker: !this.state.show_date_picker
                    })
                }}>{moment(this.state.view_date).format('YY-MM-DD')}</Button>
                <Button onClick={e => {
                    this.calendar.calendarInst.next()
                    // update current view date
                    let new_date = new Date(this.state.view_date)
                    new_date.setDate(this.state.view_date.getDate() + 7)
                    console.log(new_date)
                    this.setState({
                        view_date: new_date
                    })
                }}>next week</Button>

                {date_picker_element}

            </div>

            <div>
                <Calendar

                    ref={r => {
                        this.calendar = r

                    }}
                    height="900px"
                    calendars={[
                        {
                            id: '0',
                            name: 'Private',
                            color: 'white',
                            bgColor: '#4275ff',
                            borderColor: '#9e5fff'
                        }

                    ]}
                    useCreationPopup={false}
                    useDetailPopup={false}
                    disableDblClick={true}
                    disableClick={false}
                    isReadOnly={false}


                    month={{
                        startDayOfWeek: 0,
                        daynames: ['일', '월', '화', '수', '목', '금', '토']
                    }}
                    schedules={schedule_formatted_data}
                    taskView={false}
                    scheduleView={['time']}

                    template={{
                        milestone(schedule) {
                            return `<span style="color:#fff;background-color: ${schedule.bgColor};">${
                                schedule.title
                                }</span>`;
                        },
                        milestoneTitle() {
                            return 'Milestone';
                        },
                        allday(schedule) {
                            return `${schedule.title}<i class="fa fa-refresh"></i>`;
                        },
                        alldayTitle() {
                            return 'All Day';
                        }
                    }}

                    timezones={[
                        {
                            timezoneOffset: +540,
                            displayLabel: 'GMT+09:00',
                            tooltip: 'Seoul'
                        }

                    ]}

                    // view={selectedView} // You can also set the `defaultView` option.
                    week={{
                        showTimezoneCollapseButton: false,
                        timezonesCollapsed: true
                    }}

                    onBeforeCreateSchedule={e => {
                        console.log('before create schedule')
                        console.log(e)
                        let new_modal_info = {
                            schedule: e
                        }
                        console.log(new_modal_info)
                        this.setState({
                            show_create_modal: true,
                            modal_info: new_modal_info
                        })
                    }}
                    onBeforeUpdateSchedule={e => {
                        let { schedule, changes } = e
                        // do check if new schedule is viable
                        this.calendar.calendarInst.updateSchedule(schedule.id, schedule.calendarId, changes)
                    }}
                    onClickSchedule={e => {
                        console.log('schedule clicked')
                        console.log(e)

                        let new_modal_info = {
                            schedule: e.schedule
                        }

                        let sel_id = e.schedule.id
                        console.log(sel_id)

                        if (sel_id == null || sel_id == "") {
                            sel_id = 0
                        }

                        let sel_lesson = this.state.data[sel_id]
                        console.log("selected lesson")
                        console.log(sel_lesson)

                        this.setState({
                            modal_info: new_modal_info,
                            show_view_modal: true,
                            view_selected_lesson: sel_lesson
                        })
                    }}

                />
            </div>

        </div>


    }
}

export default ScheduleViewer