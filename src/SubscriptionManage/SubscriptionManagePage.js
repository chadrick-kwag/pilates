import React from 'react'


import { Button } from 'react-bootstrap'

import SubscriptionListView from './SubscriptionListView'

import CreatePlanView from './CreatePlanView/Base'
import CoreAdminUserCheck from '../components/CoreAdminUserCheck'



class SubscriptionManagePage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            viewmode: 'list'
        }
    }


    render() {
        let mainview
        if (this.state.viewmode == 'list') {
            mainview = <SubscriptionListView apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode == 'create') {


            mainview = <CreatePlanView onCancel={() => this.setState({ viewmode: 'list' })} onSuccess={() => this.setState({ viewmode: 'list' })} />
        }


        return <div>
            <CoreAdminUserCheck>
                <div>
                    <Button onClick={e => this.setState({
                        viewmode: 'create'
                    })}>플랜생성</Button>
                </div>
            </CoreAdminUserCheck>

            {mainview}
        </div>

    }
}

export default SubscriptionManagePage