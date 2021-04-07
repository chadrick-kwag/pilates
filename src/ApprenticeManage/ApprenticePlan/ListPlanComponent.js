import React, { useState, useEffect } from 'react'
import { Button, Grid, Table, TableHead, TableCell, TableRow, TableBody, CircularProgress } from '@material-ui/core'
import { ErrorIcon } from '@material-ui/icons'

import client from '../../apolloclient'
import { FETCH_APPRENTICE_INSTRUCTOR_PLANS } from '../../common/gql_defs'

import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'
import numeral from 'numeral'
import { DateTime } from 'luxon'

export default function ListPlanComponent(props) {

    const [plans, setPlans] = useState(null)


    useEffect(() => {

        client.query({
            query: FETCH_APPRENTICE_INSTRUCTOR_PLANS,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_apprentice_instructor_plans.success) {
                setPlans(res.data.fetch_apprentice_instructor_plans.plans)
            }
            else {
                alert(`fetch plans failed. msg:${res.data.fetch_apprentice_instructor_plans.msg}`)
                setPlans('error')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('error fetching plans')
            setPlans('error')
        })

    }, [])

    return (
        <div className="main-area col-gravity-top">
            
                <Grid container>
                    <Grid item xs style={{display: 'flex', justifyContent: 'start'}}>
                        <Button variant='contained' color='primary' onClick={e => props.onCreate()}>플랜생성</Button>
                    </Grid>
                    <Grid item xs style={{display: 'flex', justifyContent: 'center'}}>
                        <h2>견습강사플랜</h2>
                    </Grid>
                    <Grid item xs></Grid>
                </Grid>
            

            
                {plans === null ? <CircularProgress /> : plans === 'error' ? <span>failed to fetch plans</span> : <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>견습강사이름</TableCell>
                            <TableCell>타입</TableCell>
                            <TableCell>횟수</TableCell>
                            <TableCell>총비용</TableCell>
                            <TableCell>생성일</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map(d => <TableRow className='search-result' onClick={e => props.onSelect?.(d)}>
                            <TableCell>{d.apprentice_instructor_name}</TableCell>
                            <TableCell>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</TableCell>
                            <TableCell>{d.rounds}회</TableCell>
                            <TableCell>{numeral(d.totalcost).format('0,0')}원</TableCell>
                            <TableCell>{DateTime.fromISO(d.created).toFormat('y-LL-dd HH:mm')}</TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>}
            


        </div>

    )
}