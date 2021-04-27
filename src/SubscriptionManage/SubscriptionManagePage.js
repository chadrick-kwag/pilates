import React from 'react'


import { Button } from 'react-bootstrap'

import SubscriptionListView from './SubscriptionListView'
import CreateSubscriptionView from './CreateSubscriptionView'

import CreatePlanView from './CreatePlanView/Base'



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
            // mainview = <CreateSubscriptionView onCancelClick={()=>this.setState({viewmode: 'list'})}
            // onSubmitSuccess={()=>this.setState({viewmode: 'list'})}
            // apolloclient={this.props.apolloclient}
            // />

            mainview = <CreatePlanView onCancel={() => this.setState({ viewmode: 'list' })} />
        }


        return <div>
            <div>
                <Button onClick={e => this.setState({
                    viewmode: 'create'
                })}>플랜생성</Button>
            </div>
            {mainview}
        </div>

    }
}

export default SubscriptionManagePage