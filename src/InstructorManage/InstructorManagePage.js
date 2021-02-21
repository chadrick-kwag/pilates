import React from 'react'
import ListInstructorPage from './ListInstructorPage'
import CreateInstructorPage from './CreateInstructorPage'

import { Button } from 'react-bootstrap'


class InstructorManagePage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            viewmode: 'list'

        }
    }


    render() {
        let mainview
        if (this.state.viewmode === 'list') {
            mainview = <ListInstructorPage apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode === 'create') {
            mainview = <CreateInstructorPage onCancelClick={() => this.setState({ viewmode: 'list' })}
                onSubmitSuccess={() => this.setState({ viewmode: 'list' })}
                apolloclient={this.props.apolloclient}
            />
        }


        return <div>
            {this.state.viewmode !== 'create' ? <div>
                <Button onClick={e => this.setState({
                    viewmode: 'create'
                })}>강사생성</Button>
            </div> : null}

            {mainview}
        </div>

    }
}

export default InstructorManagePage