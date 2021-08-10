import ReactDOM from 'react-dom'
import React from 'react'
import { HashRouter, withRouter, Switch, Route } from 'react-router-dom'
import './styles/global.css'

import MainFrame from './components/MainFrame'
import ScheduleView from './Schedule/index'

function App({ history }) {

    return <MainFrame>
        <Switch>
            <Route path='/'>
                <ScheduleView />
            </Route>
        </Switch>
    </MainFrame>

}


const _App = withRouter(App)


ReactDOM.render(<HashRouter>
    <_App />
</HashRouter>, document.getElementById('app'))