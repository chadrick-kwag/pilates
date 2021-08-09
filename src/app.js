import React from 'react'
import ReactDOM from 'react-dom'
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect, withRouter
} from "react-router-dom";

import './common/subscription.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { ApolloProvider, } from '@apollo/react-hooks';
import SchedulePage from './SchedulePage/SchedulePage'

import ClientManagePage from './ClientManage/ClientManagePage'

// import InstructorManagePage from './InstructorManage/InstructorManagePage'
import InstructorManagePage from './InstructorManage/main'
import SubscriptionManagePage from './SubscriptionManage/main'

import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import DateFnsUtils from '@date-io/date-fns';



import client from './apolloclient'
import InstructorStatManagePage from './InstructorStatManage/InstructorStatManagePage'
import AdminPage from './adminpage/AdminPage'
import ApprenticePersonnelPage from './ApprenticeManage/ApprenticePersonnel/ApprenticePersonnelPage'
import ApprenticeCoursePage from './ApprenticeManage/ApprenticeCourse/ApprenticeCoursePage'
import ApprenticePlanPage from './ApprenticeManage/ApprenticePlan/ApprenticePlanPage'

import DashBoardContainer from './dashboard/container'

import { Grid, Button, Menu, MenuItem } from '@material-ui/core'
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

import packagejson from '../package.json'
import AuthenticateWrapper from './components/AuthenticateWrapper'
import LoginPage from './loginPage/main'
import SignUpPage from './signup/main'
import MenuDrawer from './MenuDrawer'
import AdminAccountRequestPage from './AdminAccountManage/AdminAccountRequsetPage'
import AdminAccountControlPage from './AdminAccountManage/AdminAccountControlPage'
import ProfilePage from './profilePage/main'
import PersonIcon from '@material-ui/icons/Person';
import './common/subscription.css'

import { createTheme, ThemeProvider } from '@material-ui/core/styles'



Number.prototype.format = function () {
    return this.toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(",");
};


const theme = createTheme({
    typography: {
        fontFamily: 'Noto Sans KR, sans-serif'
    }
});

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "schedule",
            showDrawer: false,
            userprofile_el: null
        }

        this.profile_handleClose = this.profile_handleClose.bind(this)
    }

    profile_handleClose() {
        this.setState({
            userprofile_el: null
        })
    }


    render() {


        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>

                <div style={{ backgroundColor: 'black' }}>
                    <Grid container>
                        <Grid item xs={4} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <MenuOpenIcon onClick={e => this.setState({
                                showDrawer: true
                            })} fontSize='large' style={{ color: 'white', margin: '5px' }} />
                        </Grid>
                        <Grid item xs={2} s={4}>

                        </Grid>
                        <Grid item xs={6} s={4}>
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row-reverse', justifyContent: 'flex-start', alignItems: 'center' }}>

                                <span style={{ color: 'white', marginRight: '2rem', whiteSpace: 'nowrap' }}>ver {packagejson.version}</span>

                                <Button style={{ textTransform: 'none', marginRight: '0.5rem', width: 'min-content' }} variant='contained' onClick={(e) => {
                                    this.setState({
                                        userprofile_el: e.target
                                    })
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', textOverflow: 'ellipsis', overflow: 'hidden' }}><PersonIcon style={{ rightMargin: '0.5rem' }} />
                                        <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{(() => {
                                            return localStorage.getItem('pilates-username')
                                        })()}님</span></div>
                                </Button>
                                <Menu
                                    anchorEl={this.state.userprofile_el}
                                    open={this.state.userprofile_el !== null}
                                    onClose={() => this.profile_handleClose()}
                                    getContentAnchorEl={null}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                                >
                                    <MenuItem onClick={() => {
                                        this.setState({
                                            userprofile_el: null
                                        })
                                        this.props.history.push('/profile')
                                    }}>
                                        프로필</MenuItem>
                                    <MenuItem onClick={() => {
                                        localStorage.removeItem('pilates-username')
                                        localStorage.removeItem('pilates-auth-token')
                                        this.props.history.push('/login')

                                    }}>로그아웃</MenuItem>


                                </Menu>

                            </div>


                        </Grid>
                    </Grid>
                </div>

                <div style={{ flexGrow: 1 }}>
                    <Switch>
                        <Route path='/dashboard'>
                            <DashBoardContainer />
                        </Route>
                        <Route path='/schedule'>
                            <SchedulePage apolloclient={client} />
                        </Route>
                        <Route path='/clientmanage'>
                            <ClientManagePage apolloclient={client} />
                        </Route>
                        <Route path='/clientplanmanage'>
                            <SubscriptionManagePage apolloclient={client} />
                        </Route>
                        <Route path='/instructormanage'>
                            <InstructorManagePage />
                        </Route>
                        <Route path='/apprenticecourse'>
                            <ApprenticeCoursePage />
                        </Route>
                        <Route path='/apprenticepersonnel'>
                            <ApprenticePersonnelPage />
                        </Route>
                        <Route path='/apprenticeplan'>
                            <ApprenticePlanPage />
                        </Route>
                        <Route path='/instructorstat'>
                            <InstructorStatManagePage />
                        </Route>
                        <Route path='/adminpage'>
                            <AdminPage />
                        </Route>
                        <Route path='/login'>
                            <LoginPage />
                        </Route>
                        <Route path='/adminaccountapprove'>
                            <AdminAccountRequestPage />
                        </Route>
                        <Route path='/adminaccountcontrol'>
                            <AdminAccountControlPage />
                        </Route>
                        <Route path='/profile'>
                            <ProfilePage />
                        </Route>
                        <Route path='/'>
                            <Redirect to="/schedule" />
                        </Route>


                    </Switch>
                </div>


                <MenuDrawer open={this.state.showDrawer} closeDrawer={() => this.setState({ showDrawer: false })} />

            </div>
        )
    }

}

const _App = withRouter(App)

ReactDOM.render(<ApolloProvider client={client}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path='/login'>
                        <LoginPage />
                    </Route>
                    <Route path='/signup'>
                        <SignUpPage />
                    </Route>
                    <Route path='/'>
                        <AuthenticateWrapper>
                            <_App />
                        </AuthenticateWrapper>
                    </Route>
                </Switch>


            </Router>
        </ThemeProvider>


    </MuiPickersUtilsProvider></ApolloProvider>, document.getElementById('app'))