import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid';
import { Button, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import {FETCH_CLIENTS_BY_PHONENUMBER} from '../common/gql_defs'
import client from '../apolloclient'
import CancelIcon from '@material-ui/icons/Cancel';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        fontFamily: 'Noto Sans KR',
        "&:active":{
            backgroundColor: 'gray'
        }
    },
    stringholder: {
        height: "4rem",
        backgroundColor: theme.palette.primary.main,
        fontFamily: 'Noto Sans KR',
        margin: "1rem"
    },
    stringholder_span: {
        fontSize: "2rem",
        color: theme.palette.primary.contrastText
    }
}));

const format_phonenumber = (pn) => {
    if (pn.length > 3) {
        pn = pn.substring(0, 3) + '-' + pn.substring(3, -1)
    }
    if (pn.length > 4) {

    }
    return pn
}


function PhonenumberInput({onSubmit}) {


    const classes = useStyles()

    const [phonenumber, setPhonenumber] = useState("010")

    const add_char_to_phonenumber = (c) => {
        if (phonenumber.length < 11) {
            setPhonenumber(phonenumber + c)
        }

    }

    const edit_back = () => {
        if (phonenumber.length > 0) {
            setPhonenumber(phonenumber.slice(0, -1))
        }

    }

    const clear = () => {
        setPhonenumber("")
    }


    const fetch_clients = ()=>{

        const _vars = {
            phonenumber: phonenumber
        }

        console.log(_vars)

        client.query({
            query: FETCH_CLIENTS_BY_PHONENUMBER,
            variables: _vars,
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)
            if(res.data.query_clients_by_phonenumber.success){
                // call onusbmit
                if(res.data.query_clients_by_phonenumber.clients.length===0){
                    alert('해당 번호를 가진 고객이 없습니다')
                }
                else{
                    onSubmit(res.data.query_clients_by_phonenumber.clients)
                }
                
            }
            else{
                alert('fetch data failed')
            }
        }).catch(e=>{
            
            alert('fetch data error')
        })
    }


    return (
        <div className={classes.root}>

            <Grid container spacing={3} justifyContent="center">
                <Grid className={classes.stringholder} item xs={12}>
                    <span className={classes.stringholder_span}>{phonenumber}</span>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("1")}>
                    <Paper elevation={5} className={classes.paper}>1</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("2")}>
                    <Paper elevation={5} className={classes.paper}>2</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("3")}>
                    <Paper elevation={5} className={classes.paper}>3</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("4")}>
                    <Paper elevation={5} className={classes.paper}>4</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("5")}>
                    <Paper elevation={5} className={classes.paper}>5</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("6")}>
                    <Paper elevation={5} className={classes.paper}>6</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("7")}>
                    <Paper elevation={5} className={classes.paper}>7</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("8")}>
                    <Paper elevation={5} className={classes.paper}>8</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("9")}>
                    <Paper elevation={5} className={classes.paper}>9</Paper>
                </Grid>
                <Grid item xs={4} onClick={() => clear()}>
                    <Paper elevation={5} className={classes.paper}><CancelIcon/></Paper>
                </Grid>
                <Grid item xs={4} onClick={() => add_char_to_phonenumber("0")}>
                    <Paper elevation={5} className={classes.paper}>0</Paper>
                </Grid>

                <Grid item xs={4} onClick={() => edit_back()}>
                    <Paper elevation={5} className={classes.paper}><KeyboardBackspaceIcon/></Paper>
                </Grid>
                <Grid item xs={12} >
                    <Grid container justify="center" direction="row" alignItems="center">
                        <Grid item>
                            <Button variant='outlined' onClick={()=>fetch_clients()}>OK</Button>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        </div>
    )
}


PhonenumberInput.propTypes = {
    onSubmit: PropTypes.func
}

export default PhonenumberInput