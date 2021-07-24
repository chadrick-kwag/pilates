import React, {useState, useEffect} from 'react' 
import Grid from '@material-ui/core/Grid';
import { Button, Paper, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import client from '../apolloclient'
import {FETCH_CLIENTINFO_AND_CHECKIN_LESSONS} from '../common/gql_defs'
import { propTypes } from 'react-bootstrap/esm/Image';
import {DateTime} from 'luxon'



const format_lesson_time = (st, et)=>{
    const _st = DateTime.fromMillis(parseInt(st)).setZone('UTC+9')
    const _et = DateTime.fromMillis(parseInt(et)).setZone('UTC+9')

    let date_str = _st.toFormat('LL-dd')
    let start_time_str = _st.toFormat('HH:mm')
    let end_time_str = _et.toFormat('HH:mm')

    return `${date_str} ${start_time_str}-${end_time_str}`
}


function SelectCheckIn({clientid, onSuccess}){

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkinLessons, setCheckinLessons] = useState([])


    useEffect(()=>{
        // fetch client data

        const _vars = {
            clientid: clientid
        }

        console.log(_vars)

        client.query({
            query:FETCH_CLIENTINFO_AND_CHECKIN_LESSONS,
            fetchPolicy: 'no-cache',
            variables: _vars

        }).then(res=>{
            console.log(res)
            if(res.data.query_checkin_lessons_of_client.success){
                
                setCheckinLessons(res.data.query_checkin_lessons_of_client.lessons)
                setLoading(false)
            }
            else{
                setError('error fetching data')
                setLoading(false)
            }
        }).catch(e=>{
            console.log(JSON.stringify(e))
            
            setError('error while fetching data')
            setLoading(false)
        })
    },[])


    const submit_attendance=(lessonid)=>{

    }


    if(loading){
        return (<div><CircularProgress/></div>)
    }
    else if(error!==null){
        return <div><span>{error}</span></div>
    }
    else{
        if(checkinLessons.length===0){
            return <div>출석 가능한 수업이 없습니다</div>
        }
        else{
            return <div>
                <Grid container>
                    {checkinLessons.map(d=><Grid item xs={12}>
                        <Paper onClick={d.id}>
                            <span>{format_lesson_time(d.starttime, d.endtime)}</span>
                            <span>{d.instructorname} 강사님</span>
                        </Paper>
                    </Grid>)}
                    
                </Grid>
            </div>
        }
    }
}


SelectCheckIn.propTypes={
    clientid: PropTypes.number,
    onSuccess: PropTypes.func

}

export default SelectCheckIn