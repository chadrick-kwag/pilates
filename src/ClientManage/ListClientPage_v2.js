/*
this version will fetch all clients and create list
realtime filter input will be used to filter clients by name.
*/

import React, { useState, useEffect } from 'react'
// import { Form, Table, Button, Spinner } from 'react-bootstrap'
import { Button, Table, TableRow, TableCell, CircularProgress, Grid, TextField, TableHead, TableBody } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

import { FETCH_CLIENTS_GQL, ABLE_CLIENT_BY_CLIENTID, DISABLE_CLIENT_BY_CLIENTID, QUERY_CLIENTS_BY_NAME } from '../common/gql_defs'


import moment from 'moment'
import ClientDetailModal from './ClientDetailModal'
import client from '../apolloclient'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';



const useStyles = makeStyles({
    tablebodyrow: {
        "&:hover": {
            backgroundColor: 'grey'
        }
    },
    disable: {
        backgroundColor: 'red'
    },
    enable: {
        backgroundColor: 'green',
        color: 'white'
    },
    center: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default function ListClientPageV2(props) {

    const [searchName, setSearchName] = useState("")
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showDetailClientId, setShowDetailClientId] = useState(null)
    const [showEnabledClients, setShowEnabledClients] = useState(true)
    const [showDisabledClients, setShowDisabledClients] = useState(false)


    const classes = useStyles()

    const fetch_all_clients = () => {

        setIsLoading(true)

        client.query({
            query: FETCH_CLIENTS_GQL,
            fetchPolicy: 'no-cache'
        }).then(res => {

            console.log(res)

            setIsLoading(false)

            if (res.data.fetch_clients.success) {
                setData(res.data.fetch_clients.clients)
            }
            else {
                alert('client fetch failed')
            }

        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('client fetch error')
        })
    }

    useEffect(() => {

        fetch_all_clients()
    }, [])



    const request_enable_client = (clientid) => {
        client.mutate({
            mutation: ABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.able_client_by_clientid.success) {
                // refetch
                setData(null)

                fetch_all_clients()
                alert('활성화 성공')

            }
            else {
                alert('활성화 실패')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('활성화 에러')
        })
    }

    const request_disable_client = (clientid) => {
        client.mutate({
            mutation: DISABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.disable_client_by_clientid.success) {
                // refetch
                setData(null)
                fetch_all_clients()
                alert('비활성화 성공')

            }
            else {
                alert('비활성화 실패')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('비활성화 에러')
        })
    }


    const get_filtered_data = () => {

        let filter_name

        if (searchName === null) {
            filter_name = ""

        }
        else {
            filter_name = searchName.trim()
        }

        let filtered_data = []
        if (filter_name === "") {
            filtered_data = data
        }
        else {
            let re = new RegExp('.*' + filter_name + '.*')

            filtered_data = data.filter(d => {
                if (re.test(d.name.trim())) {
                    return true
                }
                return false
            })
        }

        filtered_data = filtered_data.sort((a, b) => parseInt(a.id) > parseInt(b.id) ? 1 : -1)

        return filtered_data
    }

    return (
        <div style={{ width: '100%', height: '100%', maxWidth: '100%', overflowX: 'scroll' }}>
            <Grid container>

                <>
                    <Grid item xs={12} sm={6} className={classes.center}>
                        <span>이름검색</span>
                        <TextField value={searchName} onChange={e => setSearchName(e.target.value)} />

                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControlLabel control={<Checkbox checked={showDisabledClients} onChange={() => setShowDisabledClients(!showDisabledClients)} />} label='비활성 회원 표시' />
                        <FormControlLabel control={<Checkbox checked={showEnabledClients} onChange={() => setShowEnabledClients(!showEnabledClients)} />} label='활성 회원 표시' />
                    </Grid>

                    <Grid item xs={12}>
                        {isLoading ? <CircularProgress /> : data === null ? <span>회원이 없습니다.</span> : <Table className='row-clickable-table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        회원id
                                    </TableCell>
                                    <TableCell>
                                        회원이름
                                    </TableCell>
                                    <TableCell>
                                        연락처
                                    </TableCell>
                                    <TableCell>
                                        생성일시
                                    </TableCell>
                                    <TableCell>
                                        설정
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {get_filtered_data().map(d => {
                                    if (!showDisabledClients && d.disabled) {
                                        return null
                                    }

                                    if (!showEnabledClients && !d.disabled) {
                                        return null
                                    }

                                    return <TableRow onClick={() => setShowDetailClientId(d.id)} className={classes.tablebodyrow}>
                                        <TableCell>{d.id}</TableCell>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>{d.phonenumber}</TableCell>
                                        <TableCell>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</TableCell>
                                        <TableCell>

                                            {d.disabled ? <Button className={classes.disable} onClick={e => {
                                                let asked = confirm('활성화하시겠습니까?')
                                                if (asked) {
                                                    request_enable_client(d.id)
                                                }
                                                e.stopPropagation()
                                            }}>활성화</Button> :
                                                <Button className={classes.enable} onClick={e => {
                                                    let asked = confirm('비활성화 하시겠습니까?')
                                                    if (asked) {
                                                        request_disable_client(d.id)
                                                    }
                                                    e.stopPropagation()
                                                }}>비활성화</Button>
                                            }


                                        </TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>}

                    </Grid>
                </>

            </Grid>
            {showDetailClientId !== null ? <ClientDetailModal
                clientid={showDetailClientId}
                onCancel={() => {
                    setShowDetailClientId(null)

                }}
                onRefreshData={() => fetch_all_clients()}
                onDelete={() => {
                    setShowDetailClientId(null)
                    fetch_all_clients()
                }}
            /> : null}
        </div>
    )

}
