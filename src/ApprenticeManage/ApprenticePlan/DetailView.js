import React, { useState, useEffect } from 'react'
import { Table, TableCell, TableRow, Button, CircularProgress, Checkbox } from '@material-ui/core'
import client from '../../apolloclient'

import { FETCH_APPRENTICE_PLAN_BY_ID, DELETE_APPRENTICE_PLAN } from '../../common/gql_defs'
import { DateTime } from 'luxon'

import { useQuery, useMutation } from '@apollo/client'
import { withRouter } from 'react-router-dom'

function DetailView({ history, match }) {


    const planid = parseInt(match.params.id)

    const [appInst, setAppInst] = useState(null)
    const [totalCost, setTotalCost] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [created, setCreated] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [tickets, setTickets] = useState(null)



    const { loading, data, error } = useQuery(FETCH_APPRENTICE_PLAN_BY_ID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            id: planid
        },
        onCompleted: d => {
            console.log(d)


            if (d?.fetch_apprentice_plan_by_id?.success) {

                const info = d?.fetch_apprentice_plan_by_id?.plan

                setAppInst({
                    id: info.apprentice_instructor_id,
                    name: info.apprentice_instructor_name,
                    phonenumber: info.apprentice_instructor_phonenumber
                })
                setCreated(info.created ?? null)
                setTotalCost(info.totalcost)
                setActivityType(info.activity_type)
                setGroupingType(info.grouping_type)
                setTickets(info.tickets)
            }


        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    const [deletePlan, { loading: deleteloading, error: deleteError }] = useMutation(DELETE_APPRENTICE_PLAN, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.delete_apprentice_plan.success) {
                history.push('/apprenticeplan')
            }
            else {
                alert('삭제 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))

            alert('삭제 에러')
        }
    })

    if (loading) {
        return <div className="fwh flexrow justify-center align-center">
            <CircularProgress />
        </div>
    }

    if (error || data?.fetch_apprentice_plan_by_id?.success === false) {
        return <div className="fwh flexrow justify-center align-center">
            <span>에러</span>
        </div>
    }



    return <div style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '1 1 0', overflow: 'auto' }}>
            <Table style={{ width: '100%', maxWidth: '100%', overflow: 'auto', flex: '1 1 1px' }}>
                <TableRow>
                    <TableCell className="nowb">견습강사</TableCell>
                    <TableCell>{appInst?.name}({appInst?.phonenumber})</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="nowb">수업종류</TableCell>
                    <TableCell>
                        <span>{activityType}/{groupingType}</span>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="nowb">횟수</TableCell>
                    <TableCell>
                        <span>{tickets?.length}회</span>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="nowb">총비용</TableCell>
                    <TableCell>
                        <span>{totalCost}원</span>
                    </TableCell>
                </TableRow>
                <TableRow>

                    <TableCell className="nowb">티켓</TableCell>
                    <TableCell>


                        <Table>
                            <TableRow>

                                <TableCell className="nowb">
                                    티켓id
                                </TableCell>
                                <TableCell className="nowb">
                                    만료일
                                </TableCell>
                                <TableCell className="nowb">
                                    소모일
                                </TableCell>
                            </TableRow>
                            {tickets?.map((d, i) => <TableRow>

                                <TableCell>
                                    {d.id}
                                </TableCell>
                                <TableCell>
                                    {DateTime.fromMillis(parseInt(d.expire_time)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                                </TableCell>
                                <TableCell>
                                    {d.consumed_time ? DateTime.fromMillis(parseInt(d.consumed_time)).setZone('utc+9').toFormat('y-LL-dd HH:mm') : '-'}
                                </TableCell>
                            </TableRow>)}
                        </Table>


                    </TableCell>
                </TableRow>

            </Table>

        </div>



        <div className="flexrow justify-center align-center" style={{ gap: '0.5rem' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
            <Button variant='outlined' onClick={() => history.push(`/apprenticeplan/edit/${planid}`)}>수정</Button>
            <Button variant='outlined' onClick={() => deletePlan({
                variables: {
                    id: planid
                }
            })}>삭제</Button>
        </div>

    </div>
}


export default withRouter(DetailView)