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

Number.prototype.format = function () {
    return this.toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(",");
};


class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "client_manage"
        }
    }

    render() {

        let mainview



        if (this.state.viewmode == "schedule") {
            mainview = <SchedulePage apolloclient={client} />
        }
        else if (this.state.viewmode == "client_manage") {
            mainview = <ClientManagePage apolloclient={client} />
        }
        else if (this.state.viewmode == 'instructor_manage') {
            mainview = <InstructorManagePage apolloclient={client} />
        }
        else if (this.state.viewmode === "plan_manage") {
            mainview = <SubscriptionManagePage apolloclient={client} />
        }
        else {
            mainview = <div>not yet implemented</div>
        }

        return <div>

            <TopNavBar
                onClientManageClick={() => this.setState({ viewmode: "client_manage" })}
                onInstructorManageClick={() => this.setState({ viewmode: "instructor_manage" })}
                onPlanManageClick={() => this.setState({ viewmode: "plan_manage" })}
                onScheduleManageClick={() => this.setState({ viewmode: "schedule" })}
            />

            {mainview}

        </div>
    }
}

ReactDOM.render(<ApolloProvider client={client}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <App />
    </MuiPickersUtilsProvider></ApolloProvider>, document.getElementById('app'))