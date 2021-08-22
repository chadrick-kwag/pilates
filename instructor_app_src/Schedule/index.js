import React, { useRef, useState, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import DayScheduleView from '../components/DayScheduleView/main'
import { CircularProgress, Popover, List, ListItem, Button, TextField } from '@material-ui/core'
import { DateTime } from 'luxon'
import { makeStyles } from '@material-ui/core/styles';

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import { ScheduleDateContext } from '../app'
import { FETCH_AVAILABLE_CREATE_LESSON_TYPES } from '../common/gql_defs'
import { useQuery } from '@apollo/client'
import client from '../apolloclient'
import { lesson_type_to_kor_str } from '../common/consts'

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

function Index({ history }) {

    const classes = useStyles()
    const initdate = new Date()
    const { scheduleViewDate, setScheduleViewDate } = useContext(ScheduleDateContext)

    const [showCreateMenu, setShowCreateMenu] = useState(false)
    const addref = useRef()

    const { loading, data: fetchData, error } = useQuery(FETCH_AVAILABLE_CREATE_LESSON_TYPES, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.fetch_available_create_lesson_types?.success === false) {
                alert('조회 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))

        }
    })


    return (
        <div className='fwh flex flex-col' style={{ maxHeight: '100%' }}>

            <div className="flex flex-row jc ac gap" style={{ padding: '0.5rem' }}>
                <Button variant='outlined' onClick={() => {
                    const dt = DateTime.fromJSDate(scheduleViewDate).setZone('utc+9').minus({ days: 1 })
                    setScheduleViewDate(dt.toJSDate())
                }}>
                    {"<"}
                </Button>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                    <DatePicker
                        autoOk
                        value={scheduleViewDate}
                        onChange={e => setScheduleViewDate(e)}
                        variant='dialog'
                        style={{ width: '5rem' }}

                    />
                </MuiPickersUtilsProvider>

                <Button variant='outlined' onClick={() => {
                    const dt = DateTime.fromJSDate(scheduleViewDate).setZone('utc+9').plus({ days: 1 })
                    setScheduleViewDate(dt.toJSDate())
                }}>
                    {">"}
                </Button>
            </div>
            <DayScheduleView targetDate={scheduleViewDate} onSlotClicked={s => {
                console.log(s)
                if (s.lesson_domain === 'normal_lesson') {
                    return history.push(`/lesson/normal/view/${s.indomain_id}`)
                }
                if (s.lesson_domain === 'apprentice_lesson') {
                    return history.push(`/lesson/apprenticelesson/view/${s.indomain_id}`)
                }
            }} />

            <div ref={addref} className="flex ac jc" style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: '3rem', height: '3rem', backgroundColor: 'black', borderRadius: '1rem' }}>

                <span style={{ color: 'white' }} onClick={() => {
                    setShowCreateMenu(true)
                }}>추가</span>
                <Popover anchorEl={addref?.current} open={showCreateMenu} onClose={() => setShowCreateMenu(false)}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    {(() => {
                        if (loading) return <ListItem><CircularProgress /></ListItem>

                        if (error || fetchData?.fetch_available_create_lesson_types?.success === false) {
                            return <ListItem><span>에러</span></ListItem>
                        }

                        return fetchData?.fetch_available_create_lesson_types?.lesson_types.map(a => <ListItem onClick={() => {
                            history.push(`/lesson/create/${a}`)
                        }}>{lesson_type_to_kor_str(a)}</ListItem>)
                    })()}
                </Popover>

            </div>

        </div>
    )
}

export default withRouter(Index)
