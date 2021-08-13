import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import DayScheduleView from '../components/DayScheduleView/main'
import { Button, TextField } from '@material-ui/core'
import { DateTime } from 'luxon'
import { makeStyles } from '@material-ui/core/styles';

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";



const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

function Index() {

    const classes = useStyles()
    const initdate = new Date()
    const [viewDate, setviewDate] = useState(initdate);
    return (
        <div className='fwh flex flex-col' style={{ maxHeight: '100%' }}>

            <div className="flex flex-row jc ac gap"  style={{padding: '0.5rem'}}>
                <Button variant='outlined' onClick={() => {
                    const dt = DateTime.fromJSDate(viewDate).setZone('utc+9').minus({ days: 1 })
                    setviewDate(dt.toJSDate())
                }}>
                    {"<"}
                </Button>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                    <DatePicker
                        autoOk
                        value={viewDate}
                        onChange={e => setviewDate(e)}
                        variant='dialog'
                        style={{ width: '5rem' }}

                    />
                </MuiPickersUtilsProvider>

                <Button variant='outlined' onClick={() => {
                    const dt = DateTime.fromJSDate(viewDate).setZone('utc+9').plus({ days: 1 })
                    setviewDate(dt.toJSDate())
                }}>
                    {">"}
                </Button>
            </div>
            <DayScheduleView targetDate={viewDate} />
        </div>
    )
}

export default withRouter(Index)
