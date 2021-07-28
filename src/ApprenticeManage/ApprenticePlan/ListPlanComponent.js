import React, { useState, useEffect } from 'react'
import { Button, Grid, Table, TableHead, TableCell, TableRow, TableBody, CircularProgress } from '@material-ui/core'
import { ErrorIcon } from '@material-ui/icons'

import client from '../../apolloclient'
import { FETCH_APPRENTICE_INSTRUCTOR_PLANS, FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR } from '../../common/gql_defs'

import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'
import numeral from 'numeral'
import { DateTime } from 'luxon'

import ApprenticeInstructorSearchComponent from '../../components/ApprenticeInstructorSearchComponent'
import CoreAdminUserCheck from '../../components/CoreAdminUserCheck'



export default function ListPlanComponent(props) {

    const [selectedAppInst, setSelectedAppInst] = useState(null)
    const [plans, setPlans] = useState(null)


    const request_plans_of_appinst = () => {

        if (selectedAppInst === null) {
            alert('no selected apprentice instructor')
            return
        }

        client.query({
            query: FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR,
            variables: {
                appinst_id: selectedAppInst.id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_apprentice_plans_of_apprentice_instructor.success) {
                setPlans(res.data.fetch_apprentice_plans_of_apprentice_instructor.plans)
            }
            else {
                alert(`fetch plans failed. msg:${res.data.fetch_apprentice_plans_of_apprentice_instructor.msg}`)
                setPlans('error')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('error fetching plans')
            setPlans('error')
        })
    }

    useEffect(() => {
        if (selectedAppInst !== null) {
            request_plans_of_appinst()

        }
    }, [selectedAppInst])


    return (
        <div className="main-area col-gravity-top">

            <Grid container>
                <Grid item xs style={{ display: 'flex', justifyContent: 'start' }}>
                    <CoreAdminUserCheck>
                        <Button variant='contained' color='primary' onClick={e => props.onCreate()}>플랜생성</Button>
                    </CoreAdminUserCheck>
                </Grid>
                <Grid item xs style={{ display: 'flex', justifyContent: 'center' }}>
                    <h2>견습강사플랜</h2>
                </Grid>
                <Grid item xs></Grid>
            </Grid>

            <div>
                <ApprenticeInstructorSearchComponent onSelect={d => {
                    setSelectedAppInst(d)

                }} />
            </div>


            {(() => {
                if (selectedAppInst === null) {
                    return <div>견습강사를 선택해주세요</div>
                }
                else {
                    if (plans === null) {
                        return <div><CircularProgress /> </div>
                    }
                    else if (plans === 'error') {
                        return <div>플랜 조회 실패</div>
                    }
                    else {
                        return <Table>
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
                                    <TableCell>{DateTime.fromMillis(parseInt(d.created)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    }
                }
            })()}

        </div>

    )
}