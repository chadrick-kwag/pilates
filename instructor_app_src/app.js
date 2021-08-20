import ReactDOM from 'react-dom'
import React, { useState } from 'react'
import { HashRouter, withRouter, Switch, Route } from 'react-router-dom'
import './styles/global.css'


import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import DateFnsUtils from '@date-io/date-fns';

import MainFrame from './components/MainFrame'
import ScheduleView from './Schedule/index'

import AuthenticateWrapper from './components/AuthenticateWrapper'
import LoginPage from './loginPage/main'

import ProfilePage from './Profile/index'
import LessonCreatPage from './CreateLesson/index'


export const ScheduleDateContext = React.createContext()

function App({ history }) {

    const initdate = new Date()
    const [scheduleViewDate, setScheduleViewDate] = useState(initdate)

    return <Switch>
        <Route path='/login'>
            <LoginPage />
        </Route>
        <AuthenticateWrapper>
            <MainFrame>
                <Switch>
                    <Route path='/profile'>
                        <ProfilePage />
                    </Route>
                    <Route path='/lessoncreate'>
                        <LessonCreatPage />
                    </Route>
                    <Route strict path='/'>
                        <ScheduleDateContext.Provider value={{scheduleViewDate, setScheduleViewDate}}>
                            <ScheduleView />
                        </ScheduleDateContext.Provider>
                    </Route></Switch>
            </MainFrame>
        </AuthenticateWrapper>
    </Switch>

}


const _App = withRouter(App)


ReactDOM.render(

    <HashRouter>
        <_App />
    </HashRouter>

    , document.getElementById('app'))