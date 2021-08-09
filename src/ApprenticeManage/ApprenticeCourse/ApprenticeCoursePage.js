import React, { useState } from 'react'
import CreateApprenticeComponent from './CreateApprenticeCourseComponent'

import ListApprenticeCourseComponent from './ListApprenticeCourseComponent'
import CourseInfoPage from './CourseInfoPage'
import EditPage from './EditPage'

import { withRouter, Switch, Route } from 'react-router-dom'

function ApprenticeCoursePage({ history, match }) {


    return <div style={{ width: '100%', height: '100%' }}>
        <Switch>
            <Route path={`${match.url}/create`}>
                <CreateApprenticeComponent />
            </Route>
            <Route path={`${match.url}/view/:id`}>
                <CourseInfoPage />
            </Route>
            <Route path={`${match.url}/edit/:id`}>
                <EditPage />
            </Route>
            <Route path={match.url}>
                <ListApprenticeCourseComponent />
            </Route>
        </Switch>

    </div>

}

export default withRouter(ApprenticeCoursePage)