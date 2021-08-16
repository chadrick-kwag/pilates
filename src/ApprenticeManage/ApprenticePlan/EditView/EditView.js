import React, { useState, useEffect } from 'react'
import { Chip, Table, TableCell, TableRow, Button, CircularProgress, Checkbox } from '@material-ui/core'
import client from '../../../apolloclient'

import { FETCH_APPRENTICE_PLAN_BY_ID, FETCH_APPRENTICE_TICKETS_OF_PLAN } from '../../../common/gql_defs'
import { DateTime } from 'luxon'

import { useQuery, useLazyQuery } from '@apollo/client'
import { withRouter } from 'react-router-dom'
import AddPlanTypeModal from '../../../components/AddPlanTypeModal'
import { activity_type_to_kor, grouping_type_to_kor } from '../../../common/consts'

import AskDeleteDialog from './AskDeleteDialog'
import AddTicketModal from './AddTicketModal'
import ChangeExpireTimeModal from './ChangeExpireTimeModal'

function EditView({ history, match }) {


    const planid = parseInt(match.params.id)

    const [appInst, setAppInst] = useState(null)
    const [totalCost, setTotalCost] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [created, setCreated] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [tickets, setTickets] = useState(null)

    const [SelectedTicketIndexArr, setSelectedTicketIndexArr] = useState([])
    const [modal, setmodal] = useState(null);


    const [fetchPlanInfo, { loading, data, error }] = useLazyQuery(FETCH_APPRENTICE_PLAN_BY_ID, {
        client,
        fetchPolicy: 'no-cache',
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


    useEffect(() => {
        fetchPlanInfo({
            variables: {
                id: planid
            }
        })
    }, [])

    if (loading) {
        return <div className="fwh justify-center align-center">
            <CircularProgress />
        </div>
    }

    if (error || data?.fetch_apprentice_plan_by_id?.success === false) {
        return <div className="fwh justify-center align-center">
            <span>에러</span>
        </div>
    }



    return <div className="fwh flexcol">
        <div style={{ flex: '1 0 0', overflow: 'auto' }}>
            <Table>
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

                        <div className="flexcol">
                            <div className="flexrow" style={{ gap: '0.5rem' }}>
                                <Button variant='outlined' onClick={() => setmodal(<AddTicketModal planid={planid} onClose={() => setmodal(null)} onSuccess={() => {
                                    setmodal(null)
                                    setSelectedTicketIndexArr([])
                                    fetchPlanInfo({
                                        variables: {
                                            id: planid
                                        }

                                    })
                                }} />)}>추가</Button>
                                <Button variant='outlined' className="nowb" onClick={() => setmodal(<ChangeExpireTimeModal onClose={() => setmodal(null)}
                                    onSuccess={() => {
                                        setmodal(null)
                                        setSelectedTicketIndexArr([])
                                        fetchPlanInfo({
                                            variables: {
                                                id: planid
                                            }
                                        })
                                    }}
                                    ticketIds={SelectedTicketIndexArr.map(a => tickets[a].id)}
                                />)}>만료일 변경</Button>
                                <Button variant='outlined' className="nowb" onClick={() => {
                                    setmodal(<AskDeleteDialog onClose={() => setmodal(null)} ticketIds={SelectedTicketIndexArr.map(a => tickets[a].id)} onSuccess={() => {
                                        setmodal(null)
                                        setSelectedTicketIndexArr([])
                                        fetchPlanInfo({
                                            variables: {
                                                id: planid
                                            }
                                        })
                                    }} />)
                                }}>삭제</Button>
                            </div>
                            <Table>
                                <TableRow>
                                    <TableCell></TableCell>
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
                                        <Checkbox
                                            disabled={d.consumed_time !== null}
                                            checked={(() => {
                                                return SelectedTicketIndexArr.includes(i)
                                            })()} onChange={e => {
                                                if (e.target.checked) {
                                                    setSelectedTicketIndexArr([...SelectedTicketIndexArr, i])
                                                }
                                                else {
                                                    const new_arr = SelectedTicketIndexArr.filter(x => x !== i)
                                                    setSelectedTicketIndexArr(new_arr)
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
        </div>


        <div className="flexrow justify-center align-center" style={{ gap: '0.5rem' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
        </div>

        {modal}

    </div>
}


export default withRouter(EditView)