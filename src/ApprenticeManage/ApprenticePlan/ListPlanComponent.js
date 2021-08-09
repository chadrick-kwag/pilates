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
import { withRouter } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'



function ListPlanComponent({ history, match }) {

    const [selectedAppInst, setSelectedAppInst] = useState(null)


    const [fetchPlans, { loading, data, error }] = useLazyQuery(FETCH_APPRENTICE_PLANS_OF_APPRENTICE_INSTRUCTOR, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))

        }
    })

    useEffect(() => {

        if (selectedAppInst === null) return

        console.log(selectedAppInst)

        fetchPlans({
            variables: {
                appinst_id: selectedAppInst.id
            }
        })

    }, [selectedAppInst])




    return (
        <div className="fwh flexcol">

            <div className="flexrow justify-center">
                <span style={{ fontWeight: 'bold', wordBreak: 'keep-all', fontSize: '2rem' }}>견습강사 주도수업 플랜</span>
            </div>

            <Grid container style={{ alignItems: 'center' }}>
                <Grid item xs={4} md={4}>
                    <CoreAdminUserCheck>
                        <Button variant='contained' color='primary' onClick={e => history.push(`${match.url}/create`)}>플랜생성</Button>
                    </CoreAdminUserCheck>
                </Grid>

                <Grid item xs={8} md={4}>
                    <ApprenticeInstructorSearchComponent onSelect={a => setSelectedAppInst(a)} />
                </Grid>

                <Grid item xs={0} md={4}>

                </Grid>


            </Grid>



            {(() => {

                if (loading) {
                    return <div className="justify-center align-center" style={{ flexGrow: 1 }}>
                        <CircularProgress />
                    </div>
                }

                if (error || data?.fetch_apprentice_plans_of_apprentice_instructor?.success === false) {
                    return <div className="justify-center align-center" style={{ flexGrow: 1 }}>
                        <span>에러</span>
                    </div>
                }

                if (selectedAppInst === null) {
                    return null
                }

                const plans = data?.fetch_apprentice_plans_of_apprentice_instructor?.plans
                return <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', flexGrow: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="nowb">견습강사이름</TableCell>
                                <TableCell className="nowb">타입</TableCell>
                                <TableCell className="nowb">횟수</TableCell>
                                <TableCell className="nowb">총비용</TableCell>
                                <TableCell className="nowb">생성일</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {plans?.map(d => <TableRow className='search-result' onClick={e => history.push(`/apprenticeplan/view/${d.id}`)}>
                                <TableCell>{d.apprentice_instructor_name}</TableCell>
                                <TableCell>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</TableCell>
                                <TableCell>{d.rounds}회</TableCell>
                                <TableCell>{numeral(d.totalcost).format('0,0')}원</TableCell>
                                <TableCell>{DateTime.fromMillis(parseInt(d.created)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            })()}

        </div>

    )
}


export default withRouter(ListPlanComponent)