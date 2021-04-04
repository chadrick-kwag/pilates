import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Grid from '@material-ui/core/Grid';

import CircularProgress from '@material-ui/core/CircularProgress';


import client from '../../apolloclient'
import { FETCH_APPRENTICE_COURSES } from '../../common/gql_defs'

export default function ListApprenticeCourseComponent(props) {


    const [courseData, setCourseData] = useState(null)

    useEffect(() => {
        // fetch data

        client.query({
            query: FETCH_APPRENTICE_COURSES,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.fetch_apprentice_courses.success) {
                setCourseData(res.data.fetch_apprentice_courses.courses)
            }
            else {
                alert('fetch fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch error')
        })
    }, [])

    return (
        <div>
            <Grid container>
                <Grid item xs>
                    <Button variant="contained" color='primary' onClick={e => {
                        props.onCreateCourse?.()
                        console.log('clicked')
                    }}>과정생성</Button>
                </Grid>
                <Grid item xs>
                    <div className='row-gravity-center'>
                        <h2>견습과정</h2>
                    </div>

                </Grid>
                <Grid item xs></Grid>
            </Grid>

            <div>

                {courseData === null ? <CircularProgress /> : <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                이름
                        </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courseData?.map(d => <TableRow><TableCell>{d.name}</TableCell></TableRow>)}
                    </TableBody>
                </Table>}
            </div>


        </div>
    )
}