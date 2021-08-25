import React, { useState } from 'react'
import ListPlanComponent from './ListPlanComponent'
import CreatView from './CreateView/CreatView'
import DetailView from './DetailView'
import EditView from './EditView/EditView'
import { withRouter, Switch, Route } from 'react-router-dom'

function ApprenticePlanPage({ history, match }) {


    return <Switch>
        <Route path={`${match.url}/create`}>
            <CreatView />
        </Route>
        <Route path={`${match.url}/view/:id`}>
            <DetailView />
        </Route>
        <Route path={`${match.url}/edit/:id`}>
            <EditView />
        </Route>
        <Route path={match.url}>
            <ListPlanComponent />
        </Route>
    </Switch>

}

export default withRouter(ApprenticePlanPage)