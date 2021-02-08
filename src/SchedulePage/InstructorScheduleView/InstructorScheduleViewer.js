import React from 'react'
import { Button, Modal } from 'react-bootstrap'



import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

import ClientSearchComponent2 from '../../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../../components/InstructorSearchComponent2'
import moment from 'moment'

import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { get_bg_fontcolor_for_activity_type } from '../common'


import {
    QUERY_LESSON_WITH_TIMERANGE_BY_INSTRUCTORID_GQL
} from '../../common/gql_defs'


import { get_week_range_of_date } from '../../common/date_fns'
import LessonColorToolTip from '../LessonColorTooltip'

import PartialOverlaySpinner from '../PartialOverlaySpinner'
import InstructorViewLessonModal from './InstructorViewLessonModal'


class InstructorScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected_instructor: null,
            data: null,
            modal_info: null,
            show_view_modal: false,
            create_selected_client: null,

            view_selected_lesson: null,
            view_date: new Date(),
            show_date_picker: false

        }

        this.fetchdata = this.fetchdata.bind(this)
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
            fetchPolicy: 'no-cache'


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

    render() {

        let schedule_formatted_data = []
        if (this.state.data !== null) {
            schedule_formatted_data = this.state.data.map((d, i) => {

                let starttime = d.starttime
                let endtime = d.endtime


                starttime = new Date(parseInt(starttime))
                endtime = new Date(parseInt(endtime))

                let title = d.clientname + " 회원님 / " + d.instructorname + " 강사님"

                console.log(d)

                let [bgcolor, fontcolor] = get_bg_fontcolor_for_activity_type(d.activity_type)

                return {
                    id: parseInt(i),
                    calendarId: '0',
                    title: title,
                    category: 'time',
                    dueDateClass: '',
                    start: starttime,
                    end: endtime,
                    bgColor: bgcolor,
                    color: fontcolor
                }
            })
        }


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
                            show_date_picker: false,
                            data: null
                        }, () => {
                            this.fetchdata()
                        })
                    }} /> </div>
        }

        return <div>

            {this.state.show_view_modal ? <InstructorViewLessonModal show={this.state.show_view_modal} onHide={(_) => {
                this.setState({
                    show_view_modal: false
                })

            }}
                lesson={this.state.view_selected_lesson}
                onDeleteSuccess={() => {
                    this.setState({
                        show_view_modal: false,
                        view_selected_lesson: null,
                        data: null
                    }, () => {
                        this.fetchdata()
                    })
                }}
            /> : null}


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
                                view_date: new_date,
                                data: null
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
                                view_date: new_date,
                                data: null
                            }, () => {
                                this.fetchdata()
                            })
                        }}>next week</Button>

                        {date_picker_element}
                        <LessonColorToolTip />

                    </div>

                    <div>
                        <PartialOverlaySpinner hide={this.state.data === null ? true : false}>
                            <Calendar

                                ref={r => {
                                    this.calendar = r

                                }}
                                height="60%"
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
                                        return `<span style="color:#fff;background-color: ${schedule.bgColor};">${schedule.title
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

                                onClickSchedule={e => {

                                    // let new_modal_info = {
                                    //     schedule: e.schedule
                                    // }
                                    console.log('clicked schedule')
                                    console.log(e)

                                    let sel_id = e.schedule.id

                                    if (sel_id == null || sel_id == "") {
                                        sel_id = 0
                                    }

                                    let sel_lesson = this.state.data[sel_id]
                                    console.log(sel_lesson)

                                    this.setState({
                                        // modal_info: new_modal_info,
                                        show_view_modal: true,
                                        view_selected_lesson: sel_lesson
                                    })
                                }}

                            />
                        </PartialOverlaySpinner>
                    </div>
                </div>

            }


        </div>


    }
}

export default InstructorScheduleViewer