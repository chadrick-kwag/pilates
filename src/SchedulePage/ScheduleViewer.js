import React from 'react'
import {Button} from 'react-bootstrap'
import Paper from '@material-ui/core/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    DayView,
    Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';



class ScheduleViewer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [
                { startDate: '2018-11-01T09:45', endDate: '2018-11-01T11:00', title: 'Meeting' },
                { startDate: '2018-11-01T12:00', endDate: '2018-11-01T13:30', title: 'Go to a gym' },
            ],
            currentDate: '2018-11-01'
        }

        this.createlesson = this.createlesson.bind(this)
    }

    createlesson() {

    }

    render() {

        return <div>
            

            <div>
                <Paper>
                    <Scheduler
                        data={this.state.data}
                    >
                        <ViewState
                            currentDate={this.state.currentDate}
                        />
                        <DayView
                            startDayHour={9}
                            endDayHour={14}
                        />
                        <Appointments />
                    </Scheduler>
                </Paper>
            </div>

        </div>


    }
}

export default ScheduleViewer