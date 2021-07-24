import React, {useState, useEffect} from 'react' 
import Grid from '@material-ui/core/Grid';
import { Button, Paper, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import client from '../apolloclient'
import {FETCH_CLIENTINFO_AND_CHECKIN_LESSONS} from '../common/gql_defs'
import { propTypes } from 'react-bootstrap/esm/Image';



function SelectCheckIn({clientid, onSuccess}){

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkinLessons, setCheckinLessons] = useState([])


    useEffect(()=>{
        // fetch client data
        client.query({
            query:FETCH_CLIENTINFO_AND_CHECKIN_LESSONS,
            fetchPolicy: 'no-cache',
            variables: {
                clientid: clientid
            }

        }).then(res=>{
            console.log(res)
            if(res.data.success){
                
                setCheckinLessons(res.data.lessons)
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


    if(loading){
        return (<div><CircularProgress/></div>)
    }
    else if(error!==null){
        return <div><span>{error}</span></div>
    }
    else{
        return <div>some data</div>
    }
}


SelectCheckIn.PropTypes={
    clientid: propTypes.number,
    onSuccess: propTypes.func

}

export default SelectCheckIn