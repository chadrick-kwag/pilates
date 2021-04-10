import React from 'react'
import { Button } from 'react-bootstrap'



import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

import { DatePicker } from '@material-ui/pickers'

import {
    QUERY_LESSON_WITH_DATERANGE_GQL
} from '../../common/gql_defs'


import { get_week_range_of_date } from '../../common/date_fns'

import LessonDetailModal from '../LessonDetailModal'

import client from '../../apolloclient'
import { get_bg_fontcolor_for_activity_type, get_border_color_for_grouping_type } from '../common'
import LessonColorToolTip from '../LessonColorTooltip'
import PartialOverlaySpinner from '../PartialOverlaySpinner'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import ErrorIcon from '@material-ui/icons/Error';
import ApprenticeLessonDetailModal from '../ApprenticeLessonDetailModal'


class ScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            show_create_modal: false,

            show_view_modal: false,
            view_selected_lesson: null,
            view_date: new Date(),
            show_date_picker: false,
            show_individual_lessons: true,
            show_semi_lessons: true,
            show_group_lessons: true

        }

        // this.createlesson = this.createlesson.bind(this)
        this.fetchdata = this.fetchdata.bind(this)

    }



    fetchdata() {

        // determine search date range based on view_date

        let [start_time, end_time] = get_week_range_of_date(this.state.view_date)


        client.query({
            query: QUERY_LESSON_WITH_DATERANGE_GQL,
            variables: {
                start_time: start_time.toUTCString(),
                end_time: end_time.toUTCString()
            },
            fetchPolicy: 'no-cache'


        }).then(d => {
            console.log('fetched lesson data')
            console.log(d)

            if (d.data.query_lessons_with_daterange.success) {
                this.setState({
                    data: d.data.query_lessons_with_daterange.lessons
                })
            }

            else {
                alert('failed to fetch schedule data')
            }
        }).catch(e => {

            console.log(JSON.stringify(e))
            console.log(e)
            alert('error fetching schedule data')
        })
    }

    componentDidMount() {
        this.fetchdata()
    }


    render() {

        let schedule_formatted_data = []
        if (this.state.data !== null) {
            this.state.data.forEach((d, i) => {

                // check grouping type and visibility
                let grouping_type = d.grouping_type

                console.log('grouping_type')
                console.log(grouping_type)

                if (grouping_type === 'INDIVIDUAL' && !this.state.show_individual_lessons) {
                    return
                }

                if (grouping_type === 'SEMI' && !this.state.show_semi_lessons) {
                    return
                }

                if (grouping_type === 'GROUP' && !this.state.show_group_lessons) {
                    return
                }

                let starttime = d.starttime
                let endtime = d.endtime


                starttime = new Date(parseInt(starttime))
                endtime = new Date(parseInt(endtime))

                if (d.lesson_domain === 'apprentice_lesson') {
                    let title = d.instructorname + ' 강사님'
                    let bgcolor = 'black'
                    let fontcolor = 'white'

                    schedule_formatted_data.push({
                        id: parseInt(i),
                        calendarId: '0',
                        title: title,
                        category: 'time',
                        dueDateClass: '',
                        start: starttime,
                        end: endtime,
                        bgColor: bgcolor,
                        color: fontcolor,


                    })

                }
                else if (d.lesson_domain === 'normal_lesson') {

                    let clients_str = ""
                    d.client_info_arr.forEach(a => clients_str += a.clientname + ' ')


                    let title = clients_str + "회원님 / " + d.instructorname + " 강사님"

                    let [bgcolor, fontcolor] = get_bg_fontcolor_for_activity_type(d.activity_type)

                    schedule_formatted_data.push({
                        id: parseInt(i),
                        calendarId: '0',
                        title: title,
                        category: 'time',
                        dueDateClass: '',
                        start: starttime,
                        end: endtime,
                        bgColor: bgcolor,
                        color: fontcolor,
                        borderColor: get_border_color_for_grouping_type(d.grouping_type)

                    })
                }


            })
        }

        console.log('schedule_formatted_data')
        console.log(schedule_formatted_data)




        return <div>
            {(() => {

                if (!this.state.show_view_modal) {
                    return null
                }

                if (this.state.view_selected_lesson.lesson_domain === 'normal_lesson') {
                    <LessonDetailModal
                        view_selected_lesson={this.state.view_selected_lesson}
                        onCancel={() => this.setState({
                            show_view_modal: false
                        })}
                        onDeleteSuccess={() => {
                            this.setState({
                                show_view_modal: false
                            }, () => {
                                this.fetchdata()
                            })
                        }}
                        onEditSuccess={
                            () => {
                                this.setState({
                                    show_view_modal: false
                                }, () => {
                                    this.fetchdata()
                                })
                            }
                        }

                    />
                }
                else {
                    
                    return <ApprenticeLessonDetailModal lesson={this.state.view_selected_lesson}
                        onCancel={() => this.setState({
                            show_view_modal: false,
                            view_selected_lesson: null
                        })}

                        onEditSuccess={()=>{
                            this.setState({
                                show_view_modal: false,
                                view_selected_lesson: null,
                                data: null
                            }, ()=>{
                                this.fetchdata()
                            })
                        }}
                    />
                }
            })()}
           

            <div>
                <div className="row-gravity-between">

                    <div className='className="row-gravity-center"'>

                        <FormControlLabel control={<Checkbox checked={this.state.show_individual_lessons} onChange={d => {


                            let new_val = d.target.checked

                            this.setState({
                                show_individual_lessons: new_val
                            })

                        }} />} label='개별레슨' />
                        <FormControlLabel control={<Checkbox checked={this.state.show_semi_lessons} onChange={d => {


                            let new_val = d.target.checked

                            this.setState({
                                show_semi_lessons: new_val
                            })

                        }} />} label='세미레슨' />
                        <FormControlLabel control={<Checkbox checked={this.state.show_group_lessons} onChange={d => {


                            let new_val = d.target.checked

                            this.setState({
                                show_group_lessons: new_val
                            })

                        }} />} label='그룹레슨' />

                    </div>
                    <div className="row-gravity-center">
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
                    </div>

                    <div>
                        <LessonColorToolTip />
                    </div>






                </div>

                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                    <PartialOverlaySpinner hide={this.state.data === null ? true : false} style={{ flexGrow: '1' }} >
                        <Calendar

                            ref={r => {
                                this.calendar = r

                            }}
                            // height="80%"
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
                                timezonesCollapsed: true,
                                hourStart: 7,
                                hourEnd: 23
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
            </div>


        </div>



    }
}

export default ScheduleViewer