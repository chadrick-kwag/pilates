import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Grid from '@material-ui/core/Grid';
import { CircularProgress } from '@material-ui/core';



import client from '../../apolloclient'
import { FETCH_APPRENTICE_COURSES } from '../../common/gql_defs'
import { withRouter } from 'react-router-dom'
import { useQuery } from '@apollo/client'

function ListApprenticeCourseComponent({ history, match }) {


    const [courseData, setCourseData] = useState(null)

    const { loading, data, error } = useQuery(FETCH_APPRENTICE_COURSES, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.fetch_apprentice_courses.success === false) {
                alert('데이터 조회 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }

    })

    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }

    if (error || data?.fetch_apprentice_courses?.success === false) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span>에러</span>
        </div>
    }



    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div>
                <Grid container>
                    <Grid item xs={4}>
                        <Button variant="contained" color='primary' onClick={e => {
                            history.push(`${match.url}/create`)

                        }}>과정생성</Button>
                    </Grid>
                    <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>

                        <span style={{ wordBreak: 'keep-all', fontSize: '2rem', fontWeight: 'bold' }}>견습과정</span>


                    </Grid>
                    <Grid item xs={4}></Grid>
                </Grid>
            </div>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            이름
                        </TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.fetch_apprentice_courses?.courses?.map(d => <TableRow className="hover-color" onClick={() => history.push(`${match.url}/view/${d.id}`)}>
                        <TableCell>{d.name}</TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>

        </div>



    )
}

export default withRouter(ListApprenticeCourseComponent)