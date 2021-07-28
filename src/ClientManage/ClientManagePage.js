import React from 'react'
import { Button } from 'react-bootstrap'


import CreateClientPage from './CreateClientPage'
import ListClientPageV2 from './ListClientPage_v2'




class ClientManagePage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            view_mode: "list",
            data: []
        }
    }

    render() {

        if (this.state.view_mode == "list") {
            return <div>
                
                    <div>
                        <Button onClick={e => this.setState({
                            view_mode: 'create'
                        })}>회원생성</Button>
                    </div>
                

                <div>
                    {/* <ListClientPage apolloclient={this.props.apolloclient} /> */}
                    <ListClientPageV2 />
                </div>

            </div>
        }
        else if (this.state.view_mode == 'create') {
            return <div>
                <CreateClientPage apolloclient={this.props.apolloclient}
                    cancelBtnCallback={() => {
                        console.log('cancael btn clicked')
                        this.setState({
                            view_mode: 'list'
                        })
                    }}

                    onSubmitSuccess={() => {
                        this.setState({
                            view_mode: 'list'
                        })
                    }}

                    onSubmitFail={() => {
                        alert('create client failed')
                    }}
                />
            </div>
        }
        else {
            return <div>invalid</div>
        }

    }
}



export default ClientManagePage