import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableCell, Grid, TextField, TableHead, CircularProgress, Button } from '@material-ui/core'
import client from '../apolloclient'
import {
    DISABLE_INSTURCTOR_BY_ID,
    ABLE_INSTRUCTOR_BY_ID,
    LIST_INSTRUCTOR_GQL

} from '../common/gql_defs'
import { useLazyQuery, useMutation } from '@apollo/client'
import { DateTime } from 'luxon'
import { withRouter } from 'react-router-dom'

import './local.css'


const filter_data_by_searchname = (data, searchname) => {

    const _data = [...data].sort((a, b) => {
        return a.id - b.id
    })

    if (!searchname) {
        return _data
    }

    if (searchname.trim() === "") {
        return _data
    }

    let re = new RegExp('.*' + searchname + '.*')

    const filtered = []
    _data.forEach(a => {

        if (re.exec(a.name) !== null) {
            filtered.push(a)
        }
    })

    return filtered
}


function ListInstructorPage({ history }) {


    const [searchName, setSearchName] = useState("")
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    const [getInstructors, { loading, instructorData }] = useLazyQuery(LIST_INSTRUCTOR_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.fetch_instructors.success) {
                setData(d.fetch_instructors.instructors)
            }
            else {
                setError(d.fetch_instructors.msg)
            }
        }

    })

    const [disableInstructor, { loading: disable_loading, data: disable_data, error: disable_error }] = useMutation(DISABLE_INSTURCTOR_BY_ID, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            if (!d.disable_instructor_by_id.success) {
                alert('비활성화 실패')

            }
            else {
                getInstructors()
            }
        },
        onError: e => {
            console.log(e)
            alert('비활성화 에러')
        }
    })

    const [enableInstructor, { loading: enable_loading, data: enable_data, error: enable_error }] = useMutation(ABLE_INSTRUCTOR_BY_ID, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            if (!d.able_instructor_by_id.success) {
                alert('활성화 실패')
            }
            else {
                getInstructors()
            }
        },
        onError: e => {
            console.log(e)
            alert('활성화 에러')
        }
    })

    useEffect(() => {
        getInstructors()
    }, [])

    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    else {
        if (error !== null) {
            return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>error</span>
            </div>
        }

        if (data) {
            return <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative' }}>

                <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, flexDirection: 'column' }}>


                    <div style={{ width: '100%', display: 'flex', height: '4rem', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                        <Grid container>
                            <Grid item xs={3} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Button variant='contained' color="primary" onClick={() => {
                                    history.push('/instructormanage/create')
                                }}>강사생성</Button>

                            </Grid>
                            <Grid item xs={6}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                                    <span style={{ marginRight: '0.5rem', wordBreak: 'keep-all' }}>이름검색</span>
                                    <TextField variant='outlined' value={searchName} onChange={a => setSearchName(a.target.value)} />
                                </div>
                            </Grid>
                            <Grid item xs={3}>

                            </Grid>

                        </Grid>

                    </div>


                    <div style={{ width: '100%', flex: 1, overflowY: 'auto' }}>

                        <Table>
                            <TableHead style={{ fontWeight: 'bold' }}>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        이름
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        연락처
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        생성일시
                                    </TableCell>
                                    <TableCell>

                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            {filter_data_by_searchname(data, searchName).map(a => <TableRow className="table-row" onClick={() => {

                                history.push(`/instructormanage/info/${a.id}`)
                            }}>
                                <TableCell>
                                    {a.name}
                                </TableCell>
                                <TableCell>
                                    {a.phonenumber}
                                </TableCell>
                                <TableCell>
                                    {DateTime.fromMillis(parseInt(a.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                                </TableCell>
                                <TableCell>
                                    {a.disabled ? <Button variant='outlined' onClick={(e) => {
                                        e.stopPropagation()
                                        enableInstructor({
                                            variables: {
                                                id: a.id
                                            }
                                        })

                                    }}>활성화</Button> : <Button variant='outlined' onClick={(e) => {
                                        e.stopPropagation()
                                        disableInstructor({
                                            variables: {
                                                id: a.id
                                            }
                                        })
                                    }}>비활성화</Button>}

                                </TableCell>
                            </TableRow>)}

                        </Table>



                    </div>
                </div>

            </div>
        }
        else {
            return null
        }
    }

}


export default withRouter(ListInstructorPage)