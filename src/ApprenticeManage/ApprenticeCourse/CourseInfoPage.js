import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { FETCH_APPRENTICE_COURSE_INFO } from '../../common/gql_defs'
import { withRouter } from 'react-router-dom'
import client from '../../apolloclient'
import { CircularProgress, Table, TableRow, TableCell, Button } from '@material-ui/core'

function CourseInfoPage({ history, match }) {

    const courseid = parseInt(match.params.id)

    const { loading, data, error } = useQuery(FETCH_APPRENTICE_COURSE_INFO, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            id: courseid
        },
        onCompleted: d => {
            console.log(d)

        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    if (loading) {
        return <div className="fwh flexrow justify-center align-center">
            <CircularProgress />
        </div>
    }

    if (error || data?.fetch_apprentice_course_info?.success === false) {
        return <div className="fwh flexrow justify-center align-center">
            <span>에러</span>
        </div>
    }

    return <div className="fwh flexcol">
        <Table>
            <TableRow>
                <TableCell>
                    이름
                </TableCell>
                <TableCell>
                    {data?.fetch_apprentice_course_info?.course?.name}
                </TableCell>
            </TableRow>
        </Table>
        <div className="flexrow justify-center align-center" style={{ gap: '0.5rem' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
            <Button variant='outlined' onClick={() => history.push(`/apprenticecourse/edit/${courseid}`)}>수정</Button>
        </div>
    </div>


}


export default withRouter(CourseInfoPage)