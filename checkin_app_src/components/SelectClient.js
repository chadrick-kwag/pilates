import React from 'react'
import PropTypes from 'prop-types'
import { Grid, Button, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: 'Noto Sans KR'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        padding: '1rem'
    },

}));

function SelectClient({ clients, onSelected, onCancel }) {

    const classes = useStyles()

    return <div className={classes.root}>

        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Button variant='outlined' onClick={()=>onCancel?.()}>뒤로</Button>
            </Grid>
            {clients.map(d => <Grid item xs={12}>
                <Paper className={classes.paper} elevation={5} onClick={()=>onSelected?.(d)}><span>{d.name}</span></Paper>
            </Grid>)}
        </Grid>

    </div>
}

SelectClient.propTypes = {
    clients: PropTypes.array,
    onSelected: PropTypes.func,
    onCancel: PropTypes.func
}

export default SelectClient