import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import client from '../../apolloclient'
import { Chip, Button, Table, TableRow, TableCell, CircularProgress, Checkbox, TextField } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import { FETCH_NORMAL_PLAN_DETAIL_INFO } from '../../common/gql_defs'
import { DateTime } from 'luxon'
import DeleteIcon from '@material-ui/icons/Delete';

import AddTicketDialog from './AddTicketModal'
import ChangeExpireTimeModal from './ChangeExpireTimeModal'
import AskDeleteDialog from './AskDeleteDialog'
import TransferTicketDialog from './TransferTicketDialog'

function EditView({ history, match }) {


    const [planTypes, setPlanTypes] = useState([])
    const [tickets, setTickets] = useState([])
    const [totalCost, setTotalCost] = useState(null)
    const [modal, setModal] = useState(null)

    const [selectedTicketIndexArr, setSelectedTicketIndexArr] = useState([])

    // const { loading, data: planData, error } = useQuery(FETCH_NORMAL_PLAN_DETAIL_INFO, {
    //     client,
    //     fetchPolicy: 'no-cache',
    //     variables: {
    //         planid: parseInt(match.params.id)
    //     },
    //     onCompleted: d => {
    //         console.log(d)


    //         if (d.fetch_normal_plan_detail_info.success) {
    //             const data = d.fetch_normal_plan_detail_info.planinfo
    //             setPlanTypes(data.types)
    //             setTickets(data.tickets.sort((a, b) => {
    //                 return a.id - b.id
    //             }))
    //             setTotalCost(data.totalcost)
    //         }
    //     },
    //     onError: e => console.log(JSON.stringify(e))
    // })

    const [fetchInfo, { loading, data: planData, error }] = useLazyQuery(FETCH_NORMAL_PLAN_DETAIL_INFO, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)


            if (d.fetch_normal_plan_detail_info.success) {
                const data = d.fetch_normal_plan_detail_info.planinfo
                setPlanTypes(data.types)
                setTickets(data.tickets.sort((a, b) => {
                    return a.id - b.id
                }))
                setTotalCost(data.totalcost)
            }
        },
        onError: e => console.log(JSON.stringify(e))
    })


    useEffect(() => {
        fetchInfo({
            variables: {
                planid: parseInt(match.params.id)
            }
        })
    }, [])


    const is_submit_disabled = () => {
        if (planTypes?.length === 0) {
            return true
        }

        if (tickets?.length === 0) {
            return true
        }

        return false
    }

    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            <CircularProgress />

        </div>
    }

    if (error || planData?.fetch_normal_plan_detail_info?.success === false) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            <span>에러</span>

        </div>
    }


    const is_tickets_selected = () => {
        if (selectedTicketIndexArr.length > 0) return true
        return false
    }



    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <Table>
            <TableRow>
                <TableCell>
                    생성일시
                </TableCell>
                <TableCell>
                    {DateTime.fromMillis(parseInt(planData?.fetch_normal_plan_detail_info?.planinfo?.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    회원
                </TableCell>

                <TableCell>
                    {planData?.fetch_normal_plan_detail_info?.planinfo?.clientname}({planData?.fetch_normal_plan_detail_info?.planinfo?.clientphonenumber})
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>
                    총횟수
                </TableCell>

                <TableCell>
                    {tickets?.length}
                </TableCell>
            </TableRow>


            <TableRow>
                <TableCell>
                    총가격
                </TableCell>

                <TableCell style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <TextField variant='outlined' value={totalCost} onChange={e => setTotalCost(e.target.value)}
                    />
                    <span>원</span>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>
                    플랜타입
                </TableCell>

                <TableCell>
                    {planTypes?.map((a, i) => <Chip label={<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span>{a.activity_type}/{a.grouping_type}</span>
                        <DeleteIcon onClick={() => {
                            const new_plan_types = planTypes.filter((b, j) => j !== i)
                            setPlanTypes(new_plan_types)
                        }} />
                    </div>} />)}
                    <Chip label={<span>추가</span>} onClick={() => console.log('debug')} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>
                    티켓
                </TableCell>
                <TableCell>
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.3rem' }}>
                            <Button variant='outlined' disabled={!is_tickets_selected()} onClick={() => setModal(<AskDeleteDialog
                                onClose={() => setModal(null)}
                                onSuccess={() => {
                                    setSelectedTicketIndexArr([])
                                    setModal(null)
                                    fetchInfo({
                                        variables: {
                                            planid: parseInt(match.params.id)
                                        }
                                    })
                                }}
                                ticketIds={selectedTicketIndexArr.map(i => tickets[i].id)}
                            />)}>삭제</Button>
                            <Button variant='outlined' disabled={!is_tickets_selected()}

                                onClick={() => setModal(<ChangeExpireTimeModal
                                    ticketIds={selectedTicketIndexArr.map(i => tickets[i].id)}
                                    onClose={() => setModal(null)}
                                    onSuccess={() => {
                                        setSelectedTicketIndexArr([])
                                        setModal(null)
                                        fetchInfo({
                                            variables: {
                                                planid: parseInt(match.params.id)
                                            }
                                        })
                                    }} />)}>유효일 변경</Button>
                            <Button variant='outlined' disabled={!is_tickets_selected()} onClick={() => setModal(<TransferTicketDialog
                                onClose={() => setModal(null)}
                                ticketIds={selectedTicketIndexArr.map(i => tickets[i].id)}
                                onSuccess={() => {
                                    setSelectedTicketIndexArr([])
                                    setModal(null)
                                    fetchInfo({
                                        variables: {
                                            planid: parseInt(match.params.id)
                                        }
                                    })
                                }}
                            />)}>양도</Button>
                            <Button variant='outlined' onClick={() => setModal(<AddTicketDialog planid={parseInt(match.params.id)} onClose={() => setModal(null)}
                                onSuccess={() => {
                                    setSelectedTicketIndexArr([])
                                    setModal(null)
                                    fetchInfo({
                                        variables: {
                                            planid: parseInt(match.params.id)
                                        }
                                    })
                                }}
                            />)} >추가</Button>
                        </div>
                        <Table>
                            <TableRow>
                                <TableCell>

                                </TableCell>
                                <TableCell>

                                    티켓id
                                </TableCell>
                                <TableCell>
                                    만료일
                                </TableCell>
                                <TableCell>
                                    사용수업일시
                                </TableCell>

                            </TableRow>
                            {tickets?.map((d, i) => <TableRow>
                                <TableCell>
                                    <Checkbox disabled={d.consumed_time !== null && d.consumed_time !== undefined} checked={selectedTicketIndexArr.includes(i)} onChange={() => {
                                        if (selectedTicketIndexArr.includes(i)) {
                                            const new_index_arr = selectedTicketIndexArr.filter(a => a !== i)

                                            setSelectedTicketIndexArr(new_index_arr)
                                        }
                                        else {

                                            const new_index_arr = [...selectedTicketIndexArr, i]
                                            setSelectedTicketIndexArr(new_index_arr)
                                        }
                                    }} />
                                </TableCell>
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
                    </div>

                </TableCell>
            </TableRow>

        </Table>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
            <Button disabled={is_submit_disabled()} variant='outlined'>완료</Button>
        </div>
        {modal}
    </div>
}


export default withRouter(EditView)