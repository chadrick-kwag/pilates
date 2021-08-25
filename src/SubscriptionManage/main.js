import React from 'react'


import SubscriptionListView from './SubscriptionListView'

import CreatePlanView from './CreatePlanView/Base'

import { withRouter, Switch, Route } from 'react-router-dom'


import PlanDetailView from './PlanDetailView/InfoView'
import PlanEditView from './PlanEditView/editview'


function ClientPlanPage({ history, match }) {


    return <div style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>



        <Switch>
            <Route path={`${match.url}/create`}>
                <CreatePlanView onSuccess={() => history.push(match.url)} />
            </Route>
            <Route path={`${match.url}/plan/:id`}>
                <PlanDetailView />
            </Route>
            <Route path={`${match.url}/edit/:id`}>
                <PlanEditView />
            </Route>
            <Route path={`${match.url}`}>
                <SubscriptionListView />
            </Route>
        </Switch>

    </div>
}

export default withRouter(ClientPlanPage)