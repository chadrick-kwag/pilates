import React, { useState, useEffect } from 'react'
import { Button, Table, TableRow, TableCell, CircularProgress } from '@material-ui/core'


import { QUERY_SUBSCRIPTIONS_BY_CLIENTID, QUERY_CLIENTS_BY_NAME, DELETE_SUBSCRITION_GQL } from '../common/gql_defs'

import client from '../apolloclient'
import { useLazyQuery } from '@apollo/client'
import ClientSearchComponent from '../components/ClientSearchComponent4'

import { DateTime } from 'luxon'
import { withRouter } from 'react-router-dom'
import './listview.css'
import CoreAdminUserCheck from '../components/CoreAdminUserCheck'

function ClientPlanListView({ history, match }) {

    const [searchClient, setSearchClient] = useState(null)
    const [fetchPlans, { loading, data: fetchedPlans, error }] = useLazyQuery(QUERY_SUBSCRIPTIONS_BY_CLIENTID, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => console.log(d),
        onError: e => console.log(JSON.stringify(e))
    })


    useEffect(() => {
        if (searchClient === null) {
            return
        }

        fetchPlans({
            variables: {
                clientid: searchClient.id
            }
        })
    }, [searchClient])

    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <CoreAdminUserCheck>
            <div>
                <Button variant='contained' onClick={() => {
                    history.push(`${match.url}/create`)
                }}>플랜생성</Button>
            </div>
        </CoreAdminUserCheck>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem' }}>
            <ClientSearchComponent onClientSelected={d => {
                console.log(d)
                setSearchClient(d)
            }} />
        </div>
        <div style={{ flexGrow: 1 }}>
            {(() => {

                if (searchClient === null) {
                    return null
                }
                if (loading) {
                    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </div>
                }

                if (error || fetchedPlans?.query_subscriptions_by_clientid?.success === false) {
                    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span>에러</span>
                    </div>
                }


                return <Table>
                    <TableRow style={{ fontWeight: 'bold' }}>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            회원
                        </TableCell>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            총횟수
                        </TableCell>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            생성일
                        </TableCell>
                        <TableCell>

                        </TableCell>
                    </TableRow>

                    {fetchedPlans?.query_subscriptions_by_clientid?.subscriptions?.map(d => <TableRow className='hover-colored' onClick={() => history.push(`/clientplanmanage/plan/${d.id}`)}>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            {d.clientname}
                        </TableCell>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            {d.rounds}
                        </TableCell>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            {DateTime.fromMillis(parseInt(d.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                        </TableCell>
                        <TableCell>
                            <Button variant='outlined' style={{ wordBreak: 'keep-all' }}>삭제</Button>
                        </TableCell>
                    </TableRow>)}

                </Table>



            })()}
        </div>



    </div>


}


export default withRouter(ClientPlanListView)