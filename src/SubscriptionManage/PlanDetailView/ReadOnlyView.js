import React, { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogActions, Table, TableRow, TableCell, CircularProgress, Chip, Button } from '@material-ui/core'

import client from '../../apolloclient'
import ErrorIcon from '@material-ui/icons/Error';
import { FETCH_NORMAL_PLAN_DETAIL_INFO, DELETE_SUBSCRITION_GQL } from '../../common/gql_defs'
import { DateTime } from 'luxon'
import { grouping_type_to_kor, activity_type_to_kor } from '../../common/consts'
import numeral from 'numeral'

import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles({
    
    expired: {
        backgroundColor: '#f44336'
    }
    
})


export default function ReadOnlyView(props) {

    const [data, setDate] = useState(null)
    const [loading, setLoading] = useState(true)

    const classes = useStyles()


    useEffect(() => {
        client.query({
            query: FETCH_NORMAL_PLAN_DETAIL_INFO,
            variables: {
                planid: props.planid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_normal_plan_detail_info.success) {
                setDate(res.data.fetch_normal_plan_detail_info.planinfo)
                props.setEditData?.(res.data.fetch_normal_plan_detail_info.planinfo)
            }
            else {
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            setLoading(false)
        })
    }, [])


    const request_plan_delete = () => {
        console.log('debug')

        client.mutate({
            mutation: DELETE_SUBSCRITION_GQL,
            variables: {
                id: props.planid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.delete_subscription.success) {
                props.onDeleteSuccess?.()
            }
            else {
                alert(`delete failed. msg:${res.data.delete_subscription.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert(`delete error`)
        })
    }

    const calculate_free_tickets = ()=>{
        
    }


    if (data === null) {
        if (loading === true) {
            return (<>
                <CircularProgress />
            </>)
        }
        else {
            return (
                <>
                    <div className='row-gravity-center'>
                        <ErrorIcon />
                        <span>loading failed</span>
                    </div>

                </>
            )
        }
    }
    else {

        return (
            <>
                <DialogContent>
                    <Table>
                        <TableRow>
                            <TableCell>
                                플랜id
                            </TableCell>
                            <TableCell>
                                {data.id}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                생성일시
                            </TableCell>
                            <TableCell>
                                {DateTime.fromMillis(parseInt(data.created)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                회원
                            </TableCell>
                            <TableCell>
                                <Chip label={`${data.clientname}(${data.clientphonenumber})`} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                플랜타입
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    let out = ""

                                    data.types.forEach(a => {
                                        out = out + activity_type_to_kor[a.activity_type] + '/' + grouping_type_to_kor[a.grouping_type] + ','
                                    })

                                    return out.slice(0, -1)
                                })()}
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                총가격
                            </TableCell>
                            <TableCell>
                                <span>
                                    {numeral(data.totalcost).format('0,0')}원 (회당: {numeral(Math.ceil(data.totalcost / data.tickets.length)).format('0,0')}원)
                                </span>
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                총횟수
                            </TableCell>
                            <TableCell>
                                <span>{data.tickets.length} 회</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                티켓목록
                            </TableCell>
                            <TableCell>
                                {data.tickets.length > 0 ? <Table>
                                    <TableRow>
                                        <TableCell>
                                            티켓id
                                        </TableCell>
                                        <TableCell>
                                            만료일
                                        </TableCell>
                                        <TableCell>
                                            소모된 수업시작일시
                                        </TableCell>
                                    </TableRow>
                                    {data.tickets.map(d => <TableRow className={DateTime.fromMillis(parseInt(d.expire_time)) < (new Date()) ? classes.expired : null}>
                                        <TableCell>
                                            {d.id}
                                        </TableCell>
                                        <TableCell>
                                            {DateTime.fromMillis(parseInt(d.expire_time)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            {d.consumed_time === null ? '-' : DateTime.fromMillis(parseInt(d.consumed_time)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}
                                        </TableCell>
                                    </TableRow>)}

                                </Table> : <span>티켓 없음</span>}

                            </TableCell>
                        </TableRow>
                    </Table>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => props.onCancel?.()}>이전</Button>
                    <Button onClick={() => props.onBasicEdit?.()}>기본정보수정</Button>
                    <Button onClick={() => props.onTicketEdit?.()}>티켓수정</Button>
                    <Button onClick={() => request_plan_delete()}>플랜삭제</Button>

                </DialogActions>
            </>
        )
    }

}