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

const sample_schedule = [
    {
        start: DateTime.fromObject({ hour: 8 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 9 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 8 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 8 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 8 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 18 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 22 }, { zone: 'utf+8' }),
        title: 'hello'
    },
    {
        start: DateTime.fromObject({ hour: 8 }, { zone: 'utf+8' }),
        end: DateTime.fromObject({ hour: 10, minute: 30 }, { zone: 'utf+8' }),
        title: 'hello'
    }
]



function App() {

    const [date, setDate] = useState((new Date()))
    const [detailDialog, setDetailDialog] = useState(null)




    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className='appbar' style={{ width: '100%', height: 'min-content', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <Grid container >
                <Grid item xs={3} style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                    <Button style={{ marginLeft: '0.5rem', backgroundColor: 'white' }} variant='outlined'>menu</Button>

                </Grid>
                <Grid item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>


                    <KeyboardArrowLeftIcon />

                    <DatePicker
                        id="datePicker-1"
                        value={date}
                        onChange={value => setDate(value)}

                        formatStyle="large"
                        locale='ko-KR'
                        style={{ padding: '0.3rem' }}

                    />

                    <KeyboardArrowRightIcon />

                </Grid>
                <Grid item xs={3}>

                </Grid>
            </Grid>

        </div>

        <div style={{ width: '100%', flexGrow: 1 }}>
            <DayScheduler
                targetDate={date}
                schedules={sample_schedule} onSlotClicked={(domain, indomain_id) => setDetailDialog(<DetailDialog
                    onClose={() => setDetailDialog(null)}
                    schedule_info={{
                        domain, indomain_id
                    }} />)} />
        </div>
        {detailDialog}

    </div>
}

ReactDOM.render(


    <App />


    , document.getElementById('app'))