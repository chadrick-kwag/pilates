import React, { useState, useEffect } from 'react'

import client from '../apolloclient'
import { FETCH_CLIENT_STAT } from '../common/gql_defs'
import { CircularProgress, Paper } from '@material-ui/core'


export default function ClientInfoComponent(props) {

    const [clientCount, setClientCount] = useState(null)


    useEffect(() => {
        client.query({
            query: FETCH_CLIENT_STAT,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_client_stat.success) {
                const a = res.data.fetch_client_stat.stat.total_count
                setClientCount(a)
            }
            else {
                alert('fetch client stat failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch client stat error')
        })
    }, [])

    return (
        <>
            {clientCount === null ? <CircularProgress /> : <Paper><span>총 회원수 {clientCount}명</span></Paper>}
        </>

    )
}