import React from 'react'

import { Button } from '@material-ui/core'
import { withRouter, Switch, Route } from 'react-router-dom'


import CreateClientPage from './CreateClientPage'
import ListClientPageV2 from './ListClientPage_v2'
import ClientDetailView from './ClientDetailView'
import ClientEditView from './ClientEditView'


function ClientManagePage({ history, match }) {


    return <div style={{ width: '100%', height: '100%' }}>
        <Switch>
            <Route path={`${match.url}/create`}>
                <CreateClientPage onSubmitSuccess={() => history.push(match.url)} />
            </Route>
            <Route path={`${match.url}/view/:id`}>
                <ClientDetailView />
            </Route>
            <Route path={`${match.url}/edit/:id`}>
                <ClientEditView />
            </Route>
            <Route path={match.url}>
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div >
                        <Button variant='outlined' onClick={e => history.push(`${match.url}/create`)}>회원생성</Button>
                    </div>
                    <div>
                        <ListClientPageV2 />
                    </div>

                </div>
            </Route>
        </Switch>
    </div>

}



export default withRouter(ClientManagePage)