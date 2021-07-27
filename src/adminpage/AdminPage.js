import React, { useState } from 'react'
import InstructorConfig from './InstructorConfig'
import { Route, Switch, withRouter } from 'react-router-dom'
import { List, ListItem } from '@material-ui/core'

import CheckInConfig from './CheckInConfig'

function AdminPage({ history, match }) {

    const [navSelected, setNavSelect] = useState(null)


    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
            <div style={{ width: '20%', height: '100%', backgroundColor: '#e3e3e3', padding: '1rem' }}>
                <List component="nav">
                    <ListItem selected={navSelected === 0} button onClick={() => {
                        setNavSelect(0)
                        history.push(`${match.url}/instructorconfig`)
                    }}>강사설정</ListItem>
                    <ListItem selected={navSelected === 1} button onClick={() => {
                        setNavSelect(1)
                        history.push(`${match.url}/checkin-config`)
                    }}>
                        체크인설정
                    </ListItem>
                </List>


            </div>

            <div style={{ width: '80%', height: '100%', padding: '1rem' }}>
                <Switch>
                    <Route path={`${match.url}/instructorconfig`}>
                        <InstructorConfig></InstructorConfig>
                    </Route>
                    <Route path={`${match.url}/checkin-config`}>
                        <CheckInConfig />
                    </Route>

                </Switch>

            </div>


        </div>
    )
}


export default withRouter(AdminPage)