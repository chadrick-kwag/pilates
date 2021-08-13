import React, { useState } from 'react'
import { Table, TableRow, TableCell, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { useQuery } from '@apollo/client'
import { FETCH_INSTRUCTOR_APP_PROFILE } from '../common/gql_defs'


function Index() {

    const { loading, data, error } = useQuery(FETCH_INSTRUCTOR_APP_PROFILE, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('조회 실패')
        }

    })


    if (loading) {
        return <div className='fwh flex jc ac'>
            <CircularProgress />
        </div>
    }

    if (error || data?.fetch_instructor_app_profile?.success === false) {
        return <div className='fwh flex jc ac'>
            <span>에러</span>

        </div>
    }


    const _data = data.fetch_instructor_app_profile.profile
    return (
        <div className='fwh' >
            <Table style={{marginTop: '2rem'}}>
                <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell>{_data.name}</TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>연락처</TableCell>
                    <TableCell>{_data.phonenumber}</TableCell>
                </TableRow>
            </Table>

        </div>
    )
}

export default Index
