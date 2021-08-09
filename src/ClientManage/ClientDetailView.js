import React, { useState } from 'react'
import { Chip, Table, TableRow, TableCell, Button, CircularProgress } from '@material-ui/core'
import { Form } from 'react-bootstrap'
import client from '../apolloclient'
import { useMutation, useQuery } from '@apollo/client'

import { withRouter } from 'react-router-dom'
import { QUERY_CLIENTINFO_BY_CLIENTID, FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID, DELETE_CLIENT_GQL } from '../common/gql_defs'

import { activity_type_to_kor, grouping_type_to_kor, gender_to_kor } from '../common/consts'

import { DateTime } from 'luxon'

function ClientDetailView({ history, match }) {

    const clientid = parseInt(match.params.id)

    const { loading, data, error } = useQuery(QUERY_CLIENTINFO_BY_CLIENTID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            clientid
        },
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const { loading: planLoading, data: plans, error: planError } = useQuery(FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            clientid
        },
        onCompleted: d => {
            console.log(d)

        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const [deleteClient, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_CLIENT_GQL, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.deleteclient?.success) {
                history.push('/clientmanage')
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
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />

        </div>
    }


    if (error || data?.query_clientinfo_by_clientid?.success === false) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span>에러</span>

        </div>
    }


    const clientInfo = data?.query_clientinfo_by_clientid?.client
    return <div style={{ width: '100%', height: '100%' }}>

        <Table>
            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    이름
                </TableCell>
                <TableCell>
                    {clientInfo.name}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    연락처
                </TableCell>
                <TableCell>
                    {clientInfo.phonenumber}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    성별
                </TableCell>
                <TableCell>
                    {gender_to_kor(clientInfo.gender)}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    생년월일
                </TableCell>
                <TableCell>
                    {clientInfo.birthdate === null || clientInfo.birthdate === undefined ? '-' : DateTime.fromMillis(parseInt(clientInfo.birthdate)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    주소
                </TableCell>
                <TableCell>
                    {clientInfo.address}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    이메일
                </TableCell>
                <TableCell>
                    {clientInfo.email}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    직업
                </TableCell>
                <TableCell>
                    {clientInfo.job}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    등록일
                </TableCell>
                <TableCell>
                    {clientInfo.created === null || clientInfo.created === undefined ? '-' : DateTime.fromMillis(parseInt(clientInfo.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    메모
                </TableCell>
                <TableCell>
                    <Form.Control as='textarea' value={clientInfo.memo}></Form.Control>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    플랜목록
                </TableCell>
                <TableCell>
                    {(() => {
                        if (planLoading) {
                            return <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </div>
                        }

                        if (planError || plans?.query_all_subscriptions_with_remainrounds_for_clientid?.success === false) {
                            return <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <span>에러</span>
                            </div>
                        }

                        const plan_data = plans?.query_all_subscriptions_with_remainrounds_for_clientid?.allSubscriptionsWithRemainRounds
                        console.log('plan_data')
                        console.log(plan_data)

                        return <Table>
                            <TableRow>
                                <TableCell style={{ wordBreak: 'keep-all' }}>
                                    플랜id
                                </TableCell>
                                <TableCell style={{ wordBreak: 'keep-all' }}>
                                    횟수
                                </TableCell>
                                <TableCell style={{ wordBreak: 'keep-all' }}>
                                    타입
                                </TableCell>
                                <TableCell style={{ wordBreak: 'keep-all' }}>
                                    생성일
                                </TableCell>
                            </TableRow>
                            {plan_data?.map(a => <TableRow>
                                <TableCell>
                                    {a.planid}
                                </TableCell>
                                <TableCell>
                                    {a.remain_rounds}/{a.total_rounds}
                                </TableCell>
                                <TableCell>
                                    {a.plan_types.map(b => <Chip label={`${b.activity_type}/${b.grouping_type}`} />)}
                                </TableCell>
                                <TableCell>
                                    {a.created !== null && a.created !== undefined ? DateTime.fromMillis(parseInt(a.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm') : '-'}
                                </TableCell>
                            </TableRow>)}
                        </Table>


                    })()}
                </TableCell>
            </TableRow>


        </Table>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', justifyContent: 'center' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
            <Button variant='outlined' onClick={() => history.push(`/clientmanage/edit/${clientid}`)}>수정</Button>
            <Button variant='outlined' onClick={() => deleteClient({
                variables: {
                    id: clientid
                }
            })}>{deleteLoading ? <CircularProgress size="20" /> : '삭제'}</Button>

        </div>

    </div>

}


export default withRouter(ClientDetailView)
