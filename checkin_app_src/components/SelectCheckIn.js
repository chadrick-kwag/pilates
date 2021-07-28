import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import { Button, Paper, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import client from '../apolloclient'
import { FETCH_CLIENTINFO_AND_CHECKIN_LESSONS, SUBMIT_LESSON_ATTENDANCE } from '../common/gql_defs'
import { DateTime } from 'luxon'



const format_lesson_time = (st, et) => {
    const _st = DateTime.fromMillis(parseInt(st)).setZone('UTC+9')
    const _et = DateTime.fromMillis(parseInt(et)).setZone('UTC+9')

    let date_str = _st.toFormat('LL-dd')
    let start_time_str = _st.toFormat('HH:mm')
    let end_time_str = _et.toFormat('HH:mm')

    return `${date_str} ${start_time_str}-${end_time_str}`
}



const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        padding: '1rem'
    },

}));


function SelectCheckIn({ clientid, onSuccess, onToFirstScreen }) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkinLessons, setCheckinLessons] = useState([])

    const classes = useStyles()


    useEffect(() => {
        // fetch client data

        const _vars = {
            clientid: clientid
        }

        console.log(_vars)

        client.query({
            query: FETCH_CLIENTINFO_AND_CHECKIN_LESSONS,
            fetchPolicy: 'no-cache',
            variables: _vars

        }).then(res => {
            console.log(res)
            if (res.data.query_checkin_lessons_of_client.success) {

                setCheckinLessons(res.data.query_checkin_lessons_of_client.lessons)
                setLoading(false)
            }
            else {
                setError('error fetching data')
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            setError('error while fetching data')
            setLoading(false)
        })
    }, [])


    const submit_attendance = (lessonid) => {
        const _vars = {
            clientid: clientid,
            lessonid: lessonid
        }

        client.mutate({
            mutation: SUBMIT_LESSON_ATTENDANCE,
            variables: _vars,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.checkin_lesson_for_client.success) {
                alert('출석체크 되었습니다')
                onSuccess?.()
            }
            else {
                alert('submit fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            alert('submit error')
        })

    }


    if (loading) {
        return (<div style={{ width: '100%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></div>)
    }
    else if (error !== null) {
        return <div style={{ width: '100%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><span>{error}</span></div>
    }
    else {
        if (checkinLessons.length === 0) {

            setTimeout(() => onToFirstScreen?.(), 2000)
            return <div style={{ width: '100%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ marginBottom: '1rem' }}>출석 가능한 수업이 없습니다</span>
                <Button variant='outlined' onClick={() => onToFirstScreen?.()}>처음으로</Button>
            </div>
        }
        else {
            return <div style={{ width: '100%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Button variant='outlined' onClick={() => onToFirstScreen?.()}>처음으로</Button>
                    </Grid>
                    {checkinLessons.map(d => <Grid item xs={12}>
                        <Paper className={classes.paper} elevation={3} onClick={() => submit_attendance(d.id)}>
                            <span>{format_lesson_time(d.starttime, d.endtime)}</span>
                            <span>{d.instructorname} 강사님</span>
                        </Paper>
                    </Grid>)}

                </Grid>
            </div>
        }
    }
}


SelectCheckIn.propTypes = {
    clientid: PropTypes.number,
    onSuccess: PropTypes.func,
    onToFirstScreen: PropTypes.func

}

export default SelectCheckIn