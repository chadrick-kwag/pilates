import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import './global.css'
import { Grid, Button, Menu, MenuItem, Box } from '@material-ui/core'


import { DatePicker } from 'react-rainbow-components';

import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';


import DayScheduler from './DayScheduleView/main'
import { DateTime } from 'luxon'
import DetailDialog from './DetailDialog'


function App() {

    const [date, setDate] = useState((new Date()))
    const [detailDialog, setDetailDialog] = useState(null)

    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className='appbar' style={{ width: '100%', height: 'min-content', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <Grid container >
                <Grid item xs={1}>

                </Grid>
                <Grid item xs={10} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                    <div className='arrow-box'>

                        <KeyboardArrowLeftIcon onClick={() => setDate(DateTime.fromJSDate(date).minus({ day: 1 }).toJSDate())} />
                    </div>


                    <DatePicker
                        id="datePicker-1"
                        value={date}
                        onChange={value => setDate(value)}

                        formatStyle="large"
                        locale='ko-KR'
                        style={{ padding: '0.3rem', maxWidth: '20rem' }}

                    />


                    <div className='arrow-box'>

                        <KeyboardArrowRightIcon onClick={() => setDate(DateTime.fromJSDate(date).plus({ day: 1 }).toJSDate())} />
                    </div>

                </Grid>

                <Grid item xs={1}>

                </Grid>

            </Grid>

        </div>

        <div style={{ width: '100%', flexGrow: 1 }}>
            <DayScheduler
                targetDate={date}
                onSlotClicked={(d) => setDetailDialog(<DetailDialog
                    onClose={() => setDetailDialog(null)}
                    schedule_info={d} />)} />
        </div>
        {detailDialog}

    </div>
}

ReactDOM.render(


    <App />


    , document.getElementById('app'))