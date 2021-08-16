import React, { useState, useEffect } from 'react'
// import {Button} from 'react-bootstrap'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import { Button, TableHead, TableRow } from '@material-ui/core'

import client from '../../apolloclient'

import Grid from '@material-ui/core/Grid';

import CircularProgress from '@material-ui/core/CircularProgress';

import { FETCH_APPRENTICE_INSTRUCTORS } from '../../common/gql_defs'
import ErrorIcon from '@material-ui/icons/Error';


const gender_to_kor = (g) => {
    if (g === null) {
        return null
    }

    if (g.toLowerCase() === 'male') {
        return '남'
    }
    if (g.toLowerCase() === 'female') {
        return '여'
    }

    return g
}


export default function ListPersonnelComponent(props) {


    const [apprenticeInstructors, setApprenticeInstructors] = useState(null)

    useEffect(() => {
        client.query({
            query: FETCH_APPRENTICE_INSTRUCTORS,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_apprentice_instructors.success) {
                let data = res.data.fetch_apprentice_instructors.apprenticeInstructors
                setApprenticeInstructors(data)

            }
            else {
                alert(`fetch apprentice instructors fail. msg: ${res.data.fetch_apprentice_instructors.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            setApprenticeInstructors('error')
        })
    }, [])

    return (

        <Grid container>
            <Grid item xs={4}>
                <Button variant='contained' color='primary' onClick={e => props.onCreateApprentice?.()}>견습강사생성</Button>
            </Grid>
            <Grid item xs={4} className='row-gravity-center'>
                <h2>견습강사목록</h2>
            </Grid>
            <Grid item xs={4}></Grid>

            <Grid item xs={12}>
                {apprenticeInstructors === null ? <CircularProgress /> :

                    apprenticeInstructors === 'error' ? <div><ErrorIcon /> error fetching apprentice instructors</div> :

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>이름</TableCell>
                                    <TableCell>연락처</TableCell>
                                    <TableCell>성별</TableCell>
                                    <TableCell>과정</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apprenticeInstructors.map(d => <TableRow className='search-result' onClick={e => props.onSelectViewPersonnel?.(d)}>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell>{d.phonenumber}</TableCell>
                                    <TableCell>{gender_to_kor(d.gender)}</TableCell>
                                    <TableCell>{d.course_name}</TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                }
            </Grid>
        </Grid>

    )
}