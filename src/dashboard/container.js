import React from 'react'
import { Grid } from '@material-ui/core'


import ClientInfoComponent from './ClientInfoComponent'
import InstructorInfoComponent from './InstructorInfoComponent'

export default function DashBoardContainer(props) {



    return (

        <Grid container>
            <Grid item xs={6}>
                <ClientInfoComponent />
            </Grid>
            <Grid item xs={6}>
                <InstructorInfoComponent />
            </Grid>
        </Grid>


    )
}