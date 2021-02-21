import React, { useState, useEffect } from 'react'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles, makeStyles } from '@material-ui/core/styles';;


import ClientSearchComponent3 from './ClientSearchComponent3'
import client from '../apolloclient'

import { QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID } from '../common/gql_defs'
import './clientTicketSelectComponent.css'

import CircularProgress from '@material-ui/core/CircularProgress';
import { Table } from 'react-bootstrap'
import ClearIcon from '@material-ui/icons/Clear';
import PhoneIcon from '@material-ui/icons/Phone';


import { Modal } from 'react-bootstrap'


const useStyles = makeStyles(theme => ({
    dialogpaper: {
        height: '800px'
    },
    root: {
        flexGrow: 1,
        width: '100%'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}))

export default function ClientTicketSelectComponent(props) {
    console.log('ClientTicketSelectComponent')
    console.log(props)

    const [showAddTicket, setShowAddTicket] = useState(false)
    const [addSelectedClient, setAddSelectedClient] = useState(null)
    const [planandticketlist, setPlanAndTicketList] = useState(null)

    const classes = useStyles()


    console.log('classes')
    console.log(classes)


    const fetch_tickets = () => {
        console.log('fetch tickets')
        console.log(addSelectedClient)

        client.query({
            query: QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
            variables: {
                clientid: parseInt(addSelectedClient.id),
                activity_type: props.activity_type,
                grouping_type: props.grouping_type
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.query_subscriptions_with_remainrounds_for_clientid.success) {
                console.log('success')
                let data = res.data.query_subscriptions_with_remainrounds_for_clientid.planandtickets
                console.log(data)
                setPlanAndTicketList(data)


            }
            else {
                alert('plan fetch failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('plan fetch error')
        })

    }

    useEffect(() => {
        if (addSelectedClient !== null) {
            fetch_tickets()
        }
    }, [addSelectedClient])

    console.log('rendering')
    return (
        <div style={{
            width: '800px'
        }}>

            <Modal show={showAddTicket} className={classes.dialogpaper} maxWidth='lg' open={showAddTicket} onClose={_ => setShowAddTicket(false)} >
                <Modal.Title>Subscribe</Modal.Title>
                <Modal.Body>


                    <ClientSearchComponent3 clientSelectedCallback={d => {
                        console.log('client selected')
                        console.log(d)
                        if (addSelectedClient === d) {
                            fetch_tickets()
                        }
                        setAddSelectedClient(d)


                    }
                    } />
                    {addSelectedClient !== null ? planandticketlist === null ? <CircularProgress /> : <div className='col-gravity-center'>
                        <div className='plan-select-title'>플랜 선택</div>

                        {planandticketlist.length === 0 ? <div>no plans found </div> : <Table hover>
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>잔여/전체</th>
                                </tr>
                            </thead>
                            <tbody>

                                {planandticketlist.map(d => <tr onClick={_ => {
                                    let new_ticketinfo = {
                                        ticketid: d.avail_ticket_id_list[0],
                                        name: addSelectedClient.name,
                                        phonenumber: addSelectedClient.phonenumber,
                                        clientid: addSelectedClient.id
                                    }
                                    props.onTicketSelectSuccess?.(new_ticketinfo)
                                    setShowAddTicket(false)
                                    setAddSelectedClient(null)
                                }}>
                                    <td>{d.planid}</td>
                                    <td>{d.avail_ticket_count}/{d.total_ticket_count}</td>
                                </tr>)}
                            </tbody>


                        </Table>}

                    </div> : null}

                </Modal.Body>
                <Modal.Footer>

                    <Button onClick={_ => {
                        setShowAddTicket(false)
                    }} color="primary">
                        Cancel
                </Button>

                </Modal.Footer>
            </Modal>

            <div className={classes.root}>
                <Grid container spacing={0}>
                    {props.ticket_info_arr.map((d, i) => <Grid item xs={3}>
                        <TicketGridItem name={d.name} phonenumber={d.phonenumber} onClear={() => {
                            props.removeTicketByIndex?.(i)
                        }} />
                    </Grid>)}

                    {props.maxItemSize ? props.ticket_info_arr.length < props.maxItemSize ? <Grid item xs={3}>
                        <Paper variant="outlined" square elevation={3} onClick={_ => {

                            setShowAddTicket(true)
                        }} className="card-item">
                            <div className='row-gravity-center' style={{ width: '100%', height: '100%' }}>
                                <span>add</span>
                            </div>

                        </Paper>

                    </Grid> : null : null}



                </Grid>
            </div>

        </div>
    )
}



function TicketGridItem(props) {

    const [hover, setHover] = useState(false)


    return <Paper variant="outlined" square elevation={3} className="card-item"
        onMouseEnter={_ => setHover(true)}
        onMouseLeave={_ => setHover(false)}
    >
        {hover ? <div className='card-overlay'>
            <ClearIcon onClick={_ => {
                console.log('clear clicked')
                props.onClear?.()
            }} />
        </div> : null}
        <div className='card-content'>
            <span>{props.name}</span>
            <span className='card-content-phonenumber'><PhoneIcon />{props.phonenumber}</span>
        </div>
    </Paper>


}