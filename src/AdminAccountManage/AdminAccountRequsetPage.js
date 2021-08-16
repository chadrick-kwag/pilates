import React, { useState, useEffect } from 'react'
import { Button, CircularProgress, Table, TableRow, TableCell } from '@material-ui/core'
import client from '../apolloclient'
import { DateTime } from 'luxon'
import { FETCH_ADMIN_ACCOUNT_CREATE_REQUESTS, APPROVE_ADMIN_ACCOUNT_REQUEST, DECLINE_ADMIN_ACCOUNT_REQUEST } from '../common/gql_defs'
import { useMutation } from '@apollo/client';

function AdminAccountRequestPage() {


    const [adminRequests, setAdminRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [declineRequest, { declineLoading, declineData, declineError }] = useMutation(DECLINE_ADMIN_ACCOUNT_REQUEST, {
        fetchPolicy: 'no-cache',
        client: client,
        onCompleted: (data) => {
            console.log(data)
            if (data.decline_admin_account_request.success) {
                fetch_data()
            }
            else {
                alert('삭제 실패')
            }
        },
        onError: (e) => {
            console.log(JSON.stringify(e))
            alert('삭제 에러')
        }
    })




    const fetch_data = () => {
        client.query({
            query: FETCH_ADMIN_ACCOUNT_CREATE_REQUESTS,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_admin_account_create_requests.success) {
                setAdminRequests(res.data.fetch_admin_account_create_requests.requests)
                setLoading(false)
            }
            else {
                alert('fetch data fail')
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch data error')
            setLoading(false)
        })
    }

    const approve_request = (_id) => {
        client.mutate({
            mutation: APPROVE_ADMIN_ACCOUNT_REQUEST,
            variables: {
                id: _id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.approve_admin_account_request.success) {
                setLoading(true)
                fetch_data()
            }
            else {
                alert('승인 실패')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)

            alert('approve error')
        })
    }

    useEffect(() => {
        fetch_data()
    }, [])


    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    else {
        if (adminRequests.length === 0) {

            return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>승인 대기 없음</span>
            </div>
        }
        else {

            return <>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span>관리자 계정 신청 승인</span>
                </div>
                <Table>
                    <TableRow>
                        <TableCell>
                            아이디
                        </TableCell>
                        <TableCell>
                            신청일시
                        </TableCell>
                        <TableCell>

                        </TableCell>
                    </TableRow>
                    {adminRequests.map(d => <TableRow>
                        <TableCell>
                            {d.username}
                        </TableCell>
                        <TableCell>
                            {DateTime.fromMillis(parseInt(d.request_time)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                        </TableCell>
                        <TableCell>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Button variant='outlined' onClick={() => approve_request(d.id)}>승인</Button>
                                <Button variant='outlined' onClick={() => declineRequest({
                                    variables: {
                                        id: d.id
                                    }
                                })}>삭제</Button>
                            </div>

                        </TableCell>
                    </TableRow>
                    )}
                </Table>
            </>

        }
    }
}

export default AdminAccountRequestPage