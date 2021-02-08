import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import './TopNavBar.css'
import packagejson from '../package.json'

class TopNavBar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected: 'client'
        }

        this.get_bar_item_classname = this.get_bar_item_classname.bind(this)
    }


    get_bar_item_classname(name) {
        if (this.state.selected == name) {
            return "bar-item-selected"
        }

        return "bar-item-nonselected"

    }


    render() {

        console.log(packagejson)

        return <div className="bar-container">
            <div className="row-gravity-left">
                <div className={this.get_bar_item_classname('client')} onClick={e => {
                    this.setState({
                        selected: 'client'
                    })
                    this.props.onClientManageClick()
                }}>회원관리</div>
                <div className={this.get_bar_item_classname('instructor')} onClick={e => {
                    this.setState({
                        selected: 'instructor'
                    })
                    this.props.onInstructorManageClick()
                }}>강사관리</div>
                <div className={this.get_bar_item_classname('plan')} onClick={e => {
                    this.setState({
                        selected: 'plan'
                    })
                    this.props.onPlanManageClick()
                }}>플랜관리</div>
                <div className={this.get_bar_item_classname('schedule')} onClick={e => {
                    this.setState({
                        selected: 'schedule'
                    })
                    this.props.onScheduleManageClick()
                }}>스케쥴관리</div>
            </div>
            <div>
                <span className='version' style={{fontSize: '0.8rem', color: 'white'}}>ver {packagejson.version}</span>
            </div>

        </div>
    }
}




export default TopNavBar