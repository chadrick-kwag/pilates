import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import DayScheduleView from '../components/DayScheduleView/main'

function Index() {
    const initdate = new Date()
    const [viewDate, setviewDate] = useState(initdate);
    return (
        <div>
            <DayScheduleView targetDate={viewDate} />
        </div>
    )
}

export default withRouter(Index)
