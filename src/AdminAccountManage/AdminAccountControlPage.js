import React, { useState, useEffect } from 'react'
import { CircularProgress, Table, TableRow, TableCell, Button } from '@material-ui/core'
import client from '../apolloclient'
import { FETCH_ADMIN_ACCOUNTS } from '../common/gql_defs'
import { DateTime } from 'luxon'

function AdminAccountControlPage() {

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [accountInfoArr, setAccountInfoArr] = useState([])

    const fetch_data = () => {
        client.query({
            query: FETCH_ADMIN_ACCOUNTS,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_admin_accounts.success) {
                setAccountInfoArr(res.data.fetch_admin_accounts.accounts)
                setLoading(false)
            }
            else {
                setError('fetch data failed')
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            setError('fetch data error')
            setLoading(false)
        })
    }

    useEffect(() => {
        setLoading(true)
        fetch_data()
    }, [])


    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    else {
        if (error !== null) {
            return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span>{error}</span>
                <Button onClick={() => fetch_data()}>reload</Button>
            </div>
        }
        else {

            if (accountInfoArr.length === 0) {
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span>데이터 없음</span>
                </div>
            }
            return <Table>
                <TableRow>
                    <TableCell>
                        username
                    </TableCell>
                    <TableCell>
                        created
                    </TableCell>
                    <TableCell>
                        is_core
                    </TableCell>
                    <TableCell>

                    </TableCell>
                </TableRow>
                {accountInfoArr.map(d => <TableRow>
                    <TableCell>
                        {d.username}
                    </TableCell>
                    <TableCell>
                        {DateTime.fromMillis(parseInt(d.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                        {d.is_core_admin ? <span>Y</span> : <span>N</span>}
                    </TableCell>

                    <TableCell>
                        <div>
                            <Button variant='outlined'>비번리셋</Button>
                            <Button variant='outlined'>삭제</Button>
                            {d.is_core_admin ? <Button variant='outlined'>코어박탈</Button> : <Button variant='outlined'>코어승격</Button>}
                        </div>
                    </TableCell>

                </TableRow>)}
            </Table>

        }
    }
}


export default AdminAccountControlPage