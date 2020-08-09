import React from 'react'
import { Button, Modal } from 'react-bootstrap'



import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'
import moment from 'moment'

import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import {
    ATTEMPT_UPDATE_SCHEDULE_TIME_GQL,

    DELETE_LESSON_GQL,
    CREATE_LESSON_GQL,

    QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL
} from '../common/gql_defs'


import { get_week_range_of_date } from '../common/date_fns'


class InstructorScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected_instructor: null,
            data: [],
            show_create_modal: false,
            modal_info: null,
            show_view_modal: false,
            create_selected_client: null,



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

        // determine search date range based on view_date

        let [start_time, end_time] = get_week_range_of_date(this.state.view_date)


        this.props.apolloclient.query({
            query: QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL,
            variables: {
                instructorid: parseInt(this.state.selected_instructor.id),
                start_time: start_time.toUTCString(),
                end_time: end_time.toUTCString()
            },
            fetchPolicy: 'network-only'


        }).then(d => {
            console.log('received result')
            console.log(d)
            console.log(d.data.query_lesson_with_timerange_by_instructorid.success)
            if (d.data.query_lesson_with_timerange_by_instructorid.success) {
                this.setState({
                    data: d.data.query_lesson_with_timerange_by_instructorid.lessons
                })
                console.log('success updating data')

            }
            else {
                alert('failed to fetch schedule data')
            }
        }).catch(e => {
            console.log('error fetching scehdule data')
            console.log(JSON.stringify(e))
            console.log(e)
            alert('error fetching schedule data')
        })
    }

    componentDidMount() {
        // this.fetchdata()
    }

    create_input_check() {
        console.log(this.state.create_selected_client)
        if (this.state.create_selected_client == null) {
            return false
        }

        if (this.state.selected_instructor == null) {
            return false
        }

        return true
    }


    create_lesson(cb) {

        let starttime = this.state.modal_info.schedule.start.toDate().toUTCString()
        let endtime = this.state.modal_info.schedule.end.toDate().toUTCString()

        let _variables = {
            clientids: [parseInt(this.state.create_selected_client.id)],
            instructorid: parseInt(this.state.selected_instructor.id),
            starttime: starttime,
            endtime: endtime
        }


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
                        <hr></hr>

                        <h2>강사</h2>

                        <div>
                            <span>이름: {this.state.selected_instructor.instructorname}</span>
                        </div>
                        <hr></hr>
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


        let create_modal = null


        if (this.state.show_create_modal) {

            create_modal = <Modal show={this.state.show_create_modal} onHide={() => this.setState({
                show_create_modal: false
            })}>
                <Modal.Body>
                    <ClientSearchComponent2 apolloclient={this.props.apolloclient} clientSelectedCallback={d => this.setState({
                        create_selected_client: d
                    })} />

                    <hr></hr>

                    <div>
                        <span>강사정보</span>
                        <span>이름: {this.state.selected_instructor.name}</span>
                        <span>연락처: {this.state.selected_instructor.phonenumber}</span>
                    </div>

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
        }

        console.log("create_modal")
        console.log(create_modal)


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
                        }, ()=>{
                            this.fetchdata()
                        })
                    }} /> </div>
        }

        return <div>


            {view_modal}
            {create_modal}

            <div>
                <InstructorSearchComponent2 apolloclient={this.props.apolloclient} instructorSelectedCallback={d => this.setState({
                    selected_instructor: d
                }, () => {
                    this.fetchdata()
                })} />

            </div>



            {this.state.selected_instructor == null ? null :
                <div>
                    <div>
                        <Button onClick={e => {
                            this.calendar.calendarInst.prev()
                            // update current view date
                            let new_date = new Date(this.state.view_date)
                            new_date.setDate(this.state.view_date.getDate() - 7)
                            this.setState({
                                view_date: new_date
                            }, () => {
                                this.fetchdata()
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
                            this.setState({
                                view_date: new_date
                            }, () => {
                                this.fetchdata()
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
                                // this.calendar.calendarInst.updateSchedule(schedule.id, schedule.calendarId, changes)

                                let schedule_id = schedule.id
                                if (schedule_id == "" || schedule_id == null) {
                                    schedule_id = 0
                                }

                                let selected_data = this.state.data[schedule_id]

                                let start_time, end_time
                                if (changes.start) {
                                    start_time = changes.start
                                }
                                else {
                                    start_time = new Date(parseInt(selected_data.starttime))
                                }




                                this.props.apolloclient.mutate({
                                    mutation: ATTEMPT_UPDATE_SCHEDULE_TIME_GQL,
                                    variables: {
                                        lessonid: selected_data.id,
                                        start_time: start_time.toUTCString(),
                                        end_time: changes.end.toUTCString()
                                    }

                                }).then(d => {
                                    console.log(d)

                                    if (d.data.attempt_update_lesson_time.success) {
                                        // update success
                                        this.fetchdata()
                                        return
                                    }

                                    alert('failed to update lesson: ' + d.data.attempt_update_lesson_time.msg)



                                }).catch(e => {
                                    console.log(e)
                                    console.log(JSON.stringify(e))
                                    alert("error updating lesson")
                                })
                            }}
                            onClickSchedule={e => {

                                let new_modal_info = {
                                    schedule: e.schedule
                                }

                                let sel_id = e.schedule.id

                                if (sel_id == null || sel_id == "") {
                                    sel_id = 0
                                }

                                let sel_lesson = this.state.data[sel_id]

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


        </div>


    }
}

export default InstructorScheduleViewer