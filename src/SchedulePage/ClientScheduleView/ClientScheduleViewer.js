import React from 'react'
import { Button } from 'react-bootstrap'



import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';


import PartialOverlaySpinner from '../PartialOverlaySpinner'
import { DatePicker } from '@material-ui/pickers'

import {
    CREATE_LESSON_GQL,
    QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL
} from '../../common/gql_defs'


import { get_week_range_of_date } from '../../common/date_fns'
import { get_bg_fontcolor_for_activity_type } from '../common'
import LessonColorToolTip from '../LessonColorTooltip'
import ClientViewLessonModal from './ClientViewLessonModal'
import ClientSearchComponent3 from '../../components/ClientSearchComponent3'

import LessonDetailModal from '../LessonDetailModal'



class ClientScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected_client: null,
            data: null,

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

        // determine search date range based on view_date

        let [start_time, end_time] = get_week_range_of_date(this.state.view_date)


        this.props.apolloclient.query({
            query: QUERY_LESSON_WITH_TIMERANGE_BY_CLIENTID_GQL,
            variables: {
                clientid: parseInt(this.state.selected_client.id),
                start_time: start_time.toUTCString(),
                end_time: end_time.toUTCString()
            },
            fetchPolicy: 'no-cache'


        }).then(d => {
            console.log(d)


            if (d.data.query_lesson_with_timerange_by_clientid.success) {
                this.setState({
                    data: d.data.query_lesson_with_timerange_by_clientid.lessons
                })

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
        if (this.state.selected_client == null) {
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
            clientids: [parseInt(this.state.selected_client.id)],
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


        let schedule_formatted_data = []
        if (this.state.data !== null) {
            schedule_formatted_data = this.state.data.map((d, i) => {

                let starttime = d.starttime
                let endtime = d.endtime


                starttime = new Date(parseInt(starttime))
                endtime = new Date(parseInt(endtime))
                let clients_str = ""
                d.client_info_arr.forEach(a => clients_str += a.clientname + ' ')


                let title = clients_str + "회원님 / " + d.instructorname + " 강사님"


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



        return <div>


            {this.state.show_view_modal ? <LessonDetailModal 
            cancel_options = {['client_req', 'admin_req']}
            show={this.state.show_view_modal} 
            onCancel={(_) => {
                this.setState({
                    show_view_modal: false
                })
            }}
                view_selected_lesson={this.state.view_selected_lesson}
                onDeleteSuccess={() => {
                    this.setState({
                        show_view_modal: false,
                        view_selected_lesson: null
                    }, () => {
                        this.fetchdata()
                    })
                }}

                onEditSuccess={() => {
                    console.log('oneditsuccess')
                    this.setState({
                        show_view_modal: false,
                        view_selected_lesson: null,
                        data: null
                    }, () => {
                        this.fetchdata()
                    })
                }}
            /> : null}

            <div className={this.state.selected_client === null ? 'row-gravity-left' : 'row-gravity-between'}>

                <ClientSearchComponent3 clientSelectedCallback={d => this.setState({
                    selected_client: d
                }, () => {
                    this.fetchdata()
                })
                } />

                {this.state.selected_client === null ? null : <div className='row-gravity-center'>
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
                    <DatePicker
                        style={{
                            margin: '1rem'
                        }}
                        autoOk
                        variant='inline'
                        format='yy.MM.dd'
                        showTodayButton
                        value={this.state.view_date}
                        onChange={(d) => {
                            this.calendar.calendarInst.setDate(d)
                            this.setState({
                                view_date: d,
                                show_date_picker: false,
                                data: null
                            }, () => {
                                this.fetchdata()
                            })
                        }}

                    />
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



                    <LessonColorToolTip />

                </div>}
            </div>


            {this.state.selected_client == null ? null :
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <PartialOverlaySpinner hide={this.state.data === null ? true : false} style={{ flexGrow: '1' }}>
                        <Calendar

                            ref={r => {
                                this.calendar = r

                            }}

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

                            week={{
                                showTimezoneCollapseButton: false,
                                timezonesCollapsed: true
                            }}


                            onClickSchedule={e => {

                                let sel_id = e.schedule.id

                                if (sel_id == null || sel_id == "") {
                                    sel_id = 0
                                }

                                let sel_lesson = this.state.data[sel_id]

                                this.setState({

                                    show_view_modal: true,
                                    view_selected_lesson: sel_lesson
                                })
                            }}

                        />
                    </PartialOverlaySpinner>
                </div>


            }


        </div>


    }
}

export default ClientScheduleViewer