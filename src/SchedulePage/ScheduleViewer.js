import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { gql } from '@apollo/client'


import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

import ClientSearchComponent from '../components/ClientSearchComponent'
import InstructorSearchComponent from '../components/InstructorSearchComponent'
import moment from 'moment'

const today = new Date()


const FETCH_LESSON_GQL = gql`query {
    query_all_lessons{
        clientid,
        clientname,
        instructorid,
        instructorname,
        starttime,
        endtime
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
            create_selected_instructor: null

        }

        // this.createlesson = this.createlesson.bind(this)
        this.fetchdata = this.fetchdata.bind(this)
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

            return {
                id: toString(i),
                calendarId: '0',
                title: title,
                category: 'time',
                dueDateClass: '',
                start: starttime,
                end: endtime
            }
        })
        console.log('schedule start')
        let datetimestr
        try{
            console.log(this.state.modal_info.schedule.start.toString())
            let date = this.state.modal_info.schedule.start.toDate()
            let moment_date = moment(date)

            let end_date = this.state.modal_info.schedule.end.toDate()
            let end_moment = moment(end_date)


            datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
            let endstr = end_moment.format("hh:mm A")

            datetimestr = datetimestr + endstr

        }
        catch(err){
            console.log('failed to create schedule start string')
            console.log(err)
            datetimestr = null
        }
        
        return <div>

            <Modal show={this.state.show_create_modal} onHide={() => this.setState({
                show_create_modal: false
            })}>
                <Modal.Body>
                    <ClientSearchComponent apolloclient={this.props.apolloclient} clientSelectedCallback={d=>this.setState({
                        create_selected_client: d
                    })}/>

                    <InstructorSearchComponent apolloclient={this.props.apolloclient} instructorSelectedCallback={d=>this.setState({
                        create_selected_instructor: d
                    })}/>

                    
                    <div>
                        
                        {/* {this.state.modal_info!= null ? this.state.modal_info.schedule.start.toDate().toString(): null} */}
                        {datetimestr}
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={e => {
                        // do stuff
                        this.setState({
                            show_create_modal: false
                        })
                    }}>OK</Button>
                </Modal.Footer>

            </Modal>

            <Modal show={this.state.show_view_modal} onHide={() => this.setState({
                show_view_modal: false
            })}>
                <Modal.Body>
                    view modal
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={e => {
                        this.setState({
                            show_view_modal: false
                        })
                    }
                    }>Close</Button>
                </Modal.Footer>
            </Modal>

            <div>
                <Calendar

                    ref={r => this.calendar = r}
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
                        startDayOfWeek: 0
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
                        this.setState({
                            modal_info: new_modal_info,
                            show_view_modal: true
                        })
                    }}

                />
            </div>

        </div>


    }
}

export default ScheduleViewer