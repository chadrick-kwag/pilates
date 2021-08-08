import React, { useState, useEffect } from 'react'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { DialogActions, Grid, GridItem } from '@material-ui/core'

import client from '../../apolloclient'
import { CREATE_APPRENTICE_COURSE } from '../../common/gql_defs'

import { withRouter } from 'react-router-dom'
import { useMutation } from '@apollo/client'

function CreateApprenticeComponent({ history }) {

    const [name, setName] = useState(null)

    const [createCourse, { loading, error }] = useMutation(CREATE_APPRENTICE_COURSE, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.create_apprentice_course.success) {
                history.push('/apprenticecourse')
            }
            else {
                alert('생성 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('생성 에러')
        }
    })


    const checkinput = () => {
        if (name === null || name.trim() === "") {
            return false
        }

        return true
    }

    const submit = () => {
        // check input

        if (!checkinput()) {
            alert('invalid input')
            return
        }

        createCourse({
            variables: {
                name: name
            }
        })
    }

    return (
        <div className="fwh flexcol">
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>과정 생성</span>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            과정명
                        </TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={name} onChange={e => setName(e.target.value)} />
                        </TableCell>
                    </TableRow>
                </TableBody>


            </Table>
            <div className='flexrow justify-center' style={{ gap: '0.5rem' }}>


                <Button variant='outlined' color='secondary' onClick={() => history.goBack()}>취소</Button>
                <Button variant='outlined' disabled={(() => {
                    if (name === null) return true
                    if (name.trim() === "") return true

                    return false
                })()} onClick={e => submit()}>생성</Button>

            </div>
        </div>

    )
}


export default withRouter(CreateApprenticeComponent)