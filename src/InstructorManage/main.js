import React, { useState } from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'
import ListInstructorPage from './ListInstructorPage2'

import CreateInstructorPage from './CreateInstructorPage'
import ViewInfoPage from './ViewInfoPage'

import EditInfoPage from './EditInfoPage'

function Main({ match, history }) {


    const [editInfo, setEditInfo] = useState(null)

    console.log('editInfo')
    console.log(editInfo)

    return <>

        <Switch>
            <Route path={`${match.url}/create`}  >
                <CreateInstructorPage onSubmitSuccess={() => history.push(`${match.url}`)} onSubmitFail={() => alert('생성 실패')}
                    onCancelClick={() => history.push(`${match.url}`)} />
            </Route>
            <Route path={`${match.url}/info/:id`}>
                <ViewInfoPage onInfoReceived={a=>setEditInfo(a)}/>
            </Route>
            <Route path={`${match.url}/edit/:id`}>
                <EditInfoPage initInfo={editInfo} />
            </Route>
            <Route>
                <ListInstructorPage/>
            </Route>
        </Switch>




    </>
}

export default withRouter(Main)