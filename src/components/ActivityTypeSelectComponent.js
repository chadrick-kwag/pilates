import React from 'react'
import { Button } from 'react-bootstrap'


class ActivityTypeSelectComponent extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            activity_type: this.props.activity_type
        }
    }


    render() {

        return <div className="block row-gravity-center">
            <span className="block-header">수업종류</span>

            <div className="row-gravity-center">
                <Button variant={this.state.activity_type == "PILATES" ? 'warning' : 'light'} onClick={e => this.setState({
                    activity_type: 'PILATES'
                }, ()=>this.props.onItemClicked('PILATES'))}>필라테스</Button>
                <Button variant={this.state.activity_type == "GYROTONIC" ? 'warning' : 'light'} onClick={e => this.setState({
                    activity_type: 'GYROTONIC'
                }, ()=>this.props.onItemClicked('GYROTONIC'))}>자이로토닉</Button>
                <Button variant={this.state.activity_type == "BALLET" ? 'warning' : 'light'} onClick={e => this.setState({
                    activity_type: 'BALLET'
                }, ()=>this.props.onItemClicked('BALLET'))}>발레</Button>
                <Button variant={this.state.activity_type == "GYROKINESIS" ? 'warning' : 'light'} onClick={e => this.setState({
                    activity_type: 'GYROKINESIS'
                }, ()=>this.props.onItemClicked('GYROKINESIS'))}>자이로키네시스</Button>
            </div>

        </div>
    }
}


ActivityTypeSelectComponent.defaultProps = {
    activity_type: null
}

export default ActivityTypeSelectComponent