import React from 'react'
import ReactDOM from 'react-dom'

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


import { Grid, Button, Drawer, List, Divider, ListItem, ListItemAvatar } from '@material-ui/core'
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

import packagejson from '../package.json'

Number.prototype.format = function () {
    return this.toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(",");
};


class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "client_manage",
            showDrawer: false
        }

        this.getMainView = this.getMainView.bind(this)
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
        else {
            return <div>not yet implemented</div>
        }
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
                        <Grid item xs={4}>
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'row-reverse', alignItems: 'center' }}>
                                <span style={{ color: 'white', marginRight: '2rem' }}>ver {packagejson.version}</span>

                            </div>
                        </Grid>
                    </Grid>
                </div>

                <div style={{ flex: '1' }}>
                    {this.getMainView()}
                </div>


                <Drawer anchor='left' open={this.state.showDrawer} onClose={() => this.setState({ showDrawer: false })}>
                    <div>
                        <List component="nav">

                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'dashboard'
                            })}>홈</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'schedule'
                            })}>스케쥴</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'client_manage'
                            })}>회원관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'plan_manage'
                            })}>회원플랜관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'instructor_manage'
                            })}>강사관리</ListItem>
                            <Divider variant='fullWidth' />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_course'
                            })}>견습강사 과정</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_personnel'
                            })}>견습강사 관리</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'apprentice_plan'
                            })}>견습강사 플랜</ListItem>
                            <Divider />
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'instructor_stat'
                            })}>강사통계</ListItem>
                            <ListItem button onClick={e => this.setState({
                                showDrawer: false,
                                viewmode: 'adminpage'
                            })}>관리자설정</ListItem>
                        </List>
                    </div>

                </Drawer>
            </div>
        )
    }

}

ReactDOM.render(<ApolloProvider client={client}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <App />
    </MuiPickersUtilsProvider></ApolloProvider>, document.getElementById('app'))