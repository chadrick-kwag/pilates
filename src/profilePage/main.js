import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableCell, Button, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { FETCH_ADMIN_ACCOUNT_PROFILE } from '../common/gql_defs'
import { DateTime } from 'luxon'

import ChangePasswordDialog from './ChangePasswordDialog'

function ProfilePage() {


    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [profile, setProfile] = useState(null)
    const [changepwdialog, setChangepwdialog] = useState(null)

    const fetch_data = () => {
        client.query({
            query: FETCH_ADMIN_ACCOUNT_PROFILE,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_admin_account_profile.success) {
                setProfile(res.data.fetch_admin_account_profile.profile)
                setLoading(false)
            }
            else {
                setError('fetch failed')
                setLoading(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            setError('fetch error')
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
            return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>{error}</span>
            </div>
        }
        else {
            return <>
                <Table>
                    <TableRow>
                        <TableCell>
                            username
                        </TableCell>
                        <TableCell>
                            {profile.username}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            생성일시
                        </TableCell>
                        <TableCell>
                            <span>{DateTime.fromMillis(parseInt(profile.created)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            연락처
                        </TableCell>
                        <TableCell>
                            {profile.contact}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <Button variant='outlined' onClick={() => {
                            setChangepwdialog(<ChangePasswordDialog onClose={() => setChangepwdialog(null)} onSuccess={() => setChangepwdialog(null)} />)
                        }}>비밀번호 변경</Button>
                    </TableRow>
                </Table>
                {changepwdialog}
            </>
        }
    }
}

export default ProfilePage