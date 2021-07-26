import React from 'react'
import ReactDOM from 'react-dom'
import {
    HashRouter as Router,
    Switch,
    Route,
    Link, Redirect, withRouter
} from "react-router-dom";

import './common/subscription.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { ApolloProvider, } from '@apollo/react-hooks';
import SchedulePage from './SchedulePage/SchedulePage'

import ClientManagePage from './ClientManage/ClientManagePage'
import TopNavBar from './TopNavBar'

import InstructorManagePage from './InstructorManage/InstructorManagePage'
import SubscriptionManagePage from './SubscriptionManage/SubscriptionManagePage'

import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import MomentUtils from '@date-io/moment';
import DateFnsUtils from '@date-io/date-fns';
import LuxonUtils from '@date-io/luxon';


import client from './apolloclient'
import InstructorStatManagePage from './InstructorStatManage/InstructorStatManagePage'
import AdminPage from './adminpage/AdminPage'
import ApprenticePersonnelPage from './ApprenticeManage/ApprenticePersonnel/ApprenticePersonnelPage'
import ApprenticeCoursePage from './ApprenticeManage/ApprenticeCourse/ApprenticeCoursePage'
import ApprenticePlanPage from './ApprenticeManage/ApprenticePlan/ApprenticePlanPage'

import DashBoardContainer from './dashboard/container'

import { Grid, Button, Drawer, List, Divider, ListItem, ListItemAvatar, Menu, MenuItem, Popper } from '@material-ui/core'
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

import packagejson from '../package.json'
import AuthenticateWrapper from './components/AuthenticateWrapper'
import LoginPage from './loginPage/main'
import SignUpPage from './signup/main'

Number.prototype.format = function () {
    return this.toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(",");
};


class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "schedule",
            showDrawer: false,
            userprofile_el: null
        }

        this.getMainView = this.getMainView.bind(this)
        this.profile_handleClose = this.profile_handleClose.bind(this)
    }


    getMainView() {

        if (this.state.viewmode === "schedule") {
            return <SchedulePage apolloclient={client} />
        }
        else if (this.state.viewmode === "client_manage") {
            return <ClientManagePage apolloclient={client} />
        }
        else if (this.state.viewmode === 'instructor_manage') {
            return <InstructorManagePage apolloclient={client} />
        }
        else if (this.state.viewmode === "plan_manage") {
            return <SubscriptionManagePage apolloclient={client} />
        }
        else if (this.state.viewmode === 'instructor_stat') {
            return <InstructorStatManagePage />
        }
        else if (this.state.viewmode === 'adminpage') {
            return <AdminPage />
        }
        else if (this.state.viewmode === 'apprentice_personnel') {
            return <ApprenticePersonnelPage />
        }
        else if (this.state.viewmode === 'apprentice_course') {
            return <ApprenticeCoursePage />
        }
        else if (this.state.viewmode === 'apprentice_plan') {
            return <ApprenticePlanPage />
        }
        else if (this.state.viewmode === 'dashboard') {
            return <DashBoardContainer />
        }
        else {
            return <div>not yet implemented</div>
        }
    }

    profile_handleClose() {
        this.setState({
            userprofile_el: null
        })
    }


    render() {


        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>



                <div style={{ flex: '0 min-content', backgroundColor: 'black' }}>
                    <Grid container>
                        <Grid item xs={4}>
                            <MenuOpenIcon onClick={e => this.setState({
                                showDrawer: true
                            })} fontSize='large' style={{ color: 'white', margin: '5px' }} />
                        </Grid>
                        <Grid item xs={4}>

                        </Grid>
                        <Grid item style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center' }} xs={4}>



                            <div style={{ height: '100%', display: 'flex', flexDirection: 'row-reverse', alignItems: 'center' }}>
                                <span style={{ color: 'white', marginRight: '2rem' }}>ver {packagejson.version}</span>

                            </div>
                            <div>
                                <Button style={{ textTransform: 'none' }} variant='contained' onClick={(e) => {
                                    this.setState({
                                        userprofile_el: e.target
                                    })
                                }}>{(() => {
                                    return localStorage.getItem('pilates-username')
                                })()} 님</Button>
                                <Menu
                                    anchorEl={this.state.userprofile_el}
                                    open={this.state.userprofile_el !== null}
                                    onClose={() => this.profile_handleClose()}
                                    getContentAnchorEl={null}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                                >
                                    <MenuItem onClick={() => {
                                        localStorage.removeItem('pilates-username')
                                        localStorage.removeItem('pilates-auth-token')
                                        this.props.history.push('/login')

                                    }}>logout</MenuItem>

                                </Menu>
                            </div>
                        </Grid>
                    </Grid>
                </div>

                <div style={{ flex: '1' }}>
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
                            <InstructorStatManagePage />
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
                        <Route path='/'>
                            <Redirect to="/schedule" />
                        </Route>

                    </Switch>
                </div>




                <Drawer anchor='left' open={this.state.showDrawer} onClose={() => this.setState({ showDrawer: false })}>
                    <div>
                        <List component="nav">

                            <ListItem button onClick={e => this.setState({
                                showDrawer: false

                            }, () => this.props.history.push('/dashboard'))}>홈</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false

                            }, () => this.props.history.push('/schedule'))}>스케쥴</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false

                            }, () => this.props.history.push('/clientmanage'))}>회원관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'plan_manage'
                            }, () => this.props.history.push('/planmanage'))}>회원플랜관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'instructor_manage'
                            }, () => this.props.history.push('/instructormanage'))}>강사관리</ListItem>
                            <Divider variant='fullWidth' />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_course'
                            }, () => this.props.history.push('/apprenticecourse'))}>견습강사 과정</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_personnel'
                            }, () => this.props.history.push('/apprenticepersonnel'))}>견습강사 관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_plan'
                            }, () => this.props.history.push('/apprentice_plan'))}>견습강사 플랜</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'instructor_stat'
                            }, () => this.props.history.push('/instructorstat'))}>강사통계</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'adminpage'
                            }, () => this.props.history.push('/adminpage'))}>관리자설정</ListItem>
                        </List>
                    </div>

                </Drawer>

            </div>
        )
    }

}

const _App = withRouter(App)

ReactDOM.render(<ApolloProvider client={client}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
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

    </MuiPickersUtilsProvider></ApolloProvider>, document.getElementById('app'))