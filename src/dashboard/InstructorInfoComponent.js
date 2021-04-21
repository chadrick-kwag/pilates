import React, { useState, useEffect } from 'react'

import client from '../apolloclient'
import { FETCH_INSTRUCTOR_STAT } from '../common/gql_defs'
import { CircularProgress, Paper } from '@material-ui/core'


export default function InstructorInfoComponent(props) {

    const [instructorCount, setInstructorCount] = useState(null)


    useEffect(() => {
        client.query({
            query: FETCH_INSTRUCTOR_STAT,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_instructor_stat.success) {
                const a = res.data.fetch_instructor_stat.stat.total_count
                setInstructorCount(a)
            }
            else {
                alert('fetch instructor stat failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch instructor stat error')
        })
    }, [])

    return (
        <>
            {instructorCount === null ? <CircularProgress /> : <Paper><span>총 강사수 {instructorCount}명</span></Paper>}
        </>

    )
}