import React from 'react'
import { Button } from 'react-bootstrap'
import {gql} from '@apollo/client'


import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

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
            currentDate: '2018-11-01'
        }

        // this.createlesson = this.createlesson.bind(this)
        this.fetchdata = this.fetchdata.bind(this)
    }


    fetchdata(){
        this.props.apolloclient.query({
            query: FETCH_LESSON_GQL,
            fetchPolicy: 'network-only'
        }).then(res=>{
            console.log('fetch data result')
            console.log(res)

            if(res.data.query_all_lessons){
                console.log("success fetching lesson data")
                console.log("init data")
                console.log(res.data.query_all_lessons)
                this.setState({
                    data: res.data.query_all_lessons
                })

                return

            }
            console.log("failed to fetch data")
        }).catch(e=>{
            console.log("error fetching lesson data")
        })
    }

    componentDidMount(){
        this.fetchdata()
    }

    render() {

        console.log("inside render")

        let schedule_formatted_data = this.state.data.map((d,i)=>{

            let starttime = d.starttime
            let endtime = d.endtime

            console.log(d)
            console.log(parseInt(starttime))

            starttime = new Date(parseInt(starttime))
            endtime = new Date(parseInt(endtime))

            console.log('start and end time from schedule formatted data')
            console.log(starttime.toUTCString())
            console.log(starttime.toLocaleString())
            console.log(starttime)
            console.log(endtime)

            console.log(starttime.getTime())

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


        return <div>


            <div>
                <Calendar

                    ref={r=>this.calendar = r}
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
                    disableDblClick={true}
                    disableClick={false}
                    isReadOnly={false}
                    month={{
                        startDayOfWeek: 0
                    }}
                    schedules={schedule_formatted_data}
                    scheduleView
                    taskView
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
                    useDetailPopup
                    useCreationPopup
                    // view={selectedView} // You can also set the `defaultView` option.
                    week={{
                        showTimezoneCollapseButton: true,
                        timezonesCollapsed: true
                    }}
                    
                    onBeforeCreateSchedule={e=>console.log(e)}
                    onBeforeUpdateSchedule={e=>{console.log(e)
                        let {schedule, changes} = e
                        console.log(this.calendar)
                        this.calendar.calendarInst.updateSchedule(schedule.id, schedule.calendarId,changes)

                        console.log("after update")
                        console.log(this.state.data)

                        console.log("schedule internal data")
                        console.log(this.calendar.props.schedules)

                        console.log(this.calendar.calendarInst._controller.schedules.items)
                    }}
                    
                />
            </div>

        </div>


    }
}

export default ScheduleViewer