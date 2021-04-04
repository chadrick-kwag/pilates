import React from 'react'
// import {Button} from 'react-bootstrap'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import { Button } from '@material-ui/core'

import client from '../../apolloclient'

import Grid from '@material-ui/core/Grid';

import CircularProgress from '@material-ui/core/CircularProgress';

export default function ListPersonnelComponent(props) {

    return (
        <div>
            <Grid container>
                <Grid item xs>
                    <Button variant='contained' color='primary' onClick={e => props.onCreateApprentice?.()}>견습강사생성</Button>
                </Grid>
                <Grid item xs className='row-gravity-center'>
                    <h2>견습강사목록</h2>
                </Grid>
                <Grid item xs></Grid>
            </Grid>
            <div>

            </div>

        </div>
    )
}