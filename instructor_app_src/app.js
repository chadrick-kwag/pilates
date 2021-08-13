import ReactDOM from 'react-dom'
import React from 'react'
import { HashRouter, withRouter, Switch, Route } from 'react-router-dom'
import './styles/global.css'


import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import DateFnsUtils from '@date-io/date-fns';

import MainFrame from './components/MainFrame'
import ScheduleView from './Schedule/index'

import AuthenticateWrapper from './components/AuthenticateWrapper'
import LoginPage from './loginPage/main'

function App({ history }) {

    return <Switch>
        <Route path='/login'>
            <LoginPage />
        </Route>
        <Route path='/'>
            <AuthenticateWrapper>
                <MainFrame>
                    <ScheduleView />
                </MainFrame>
            </AuthenticateWrapper>
        </Route>
    </Switch>

}


const _App = withRouter(App)


ReactDOM.render(

    <HashRouter>
        <_App />
    </HashRouter>

    , document.getElementById('app'))