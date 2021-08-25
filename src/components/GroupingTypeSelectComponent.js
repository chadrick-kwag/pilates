import React from 'react'
import {Button} from 'react-bootstrap'


class GroupingTypeSelectComponent extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            grouping_type: this.props.grouping_type
        }
    }

    render(){

        return <div className="block row-gravity-center">

                <span className="block-header">그룹방식</span>
                <div className="row-gravity-center">
                    <Button variant={this.state.grouping_type == "INDIVIDUAL" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'INDIVIDUAL'
                    }, ()=>this.props.onItemClicked('INDIVIDUAL'))}>개인</Button>
                    <Button variant={this.state.grouping_type == "SEMI" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'SEMI'
                    },  ()=>this.props.onItemClicked('SEMI'))}>세미</Button>
                    <Button variant={this.state.grouping_type == "GROUP" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'GROUP'
                    }, ()=>this.props.onItemClicked('GROUP'))}>그룹</Button>

                </div>

            </div>
    }
}


GroupingTypeSelectComponent.defaultProps = {
    grouping_type: null
}

export default GroupingTypeSelectComponent