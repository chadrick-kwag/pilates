import React from 'react'
import { OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap'
import './TopNavBar.css'
import packagejson from '../package.json'
import { BorderColor } from '@material-ui/icons'

class TopNavBar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selected: 'client',
            apprentice_dropdown_show: false
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
                <div>
                    <Dropdown>
                        <Dropdown.Toggle style={{
                            backgroundColor: 'black',
                            borderColor: 'black'
                        }}><div className={this.get_bar_item_classname('apprentice_manage')}>견습관리</div></Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={e => {
                                this.setState({
                                    selected: 'apprentice_manage'
                                })
                                this.props.onApprenticePersonnelManageClick?.()
                            }}>견습강사관리</Dropdown.Item>
                            <Dropdown.Item onClick={e => {
                                this.setState({
                                    selected: 'apprentice_manage'
                                })
                                this.props.onApprenticeCourseManageClick?.()
                            }}>견습과정관리</Dropdown.Item>
                            <Dropdown.Item onClick={e => {
                                this.setState({
                                    selected: 'apprentice_manage'
                                })
                                this.props.onApprenticePlanManageClick?.()
                            }}>견습플랜관리</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={this.get_bar_item_classname('schedule')} onClick={e => {
                    this.setState({
                        selected: 'schedule'
                    })
                    this.props.onScheduleManageClick()
                }}>스케쥴관리</div>
                <div className={this.get_bar_item_classname('instructorstat')} onClick={e => {
                    this.setState({
                        selected: 'instructorstat'
                    })
                    this.props.onInstructorStatClick?.()
                }}>강사통계</div>
                <div className={this.get_bar_item_classname('adminpage')} onClick={e => {
                    this.setState({
                        selected: 'adminpage'
                    })
                    this.props.onAdminPageClick?.()
                }}>관리자설정</div>
            </div>
            <div>
                <span className='version' style={{ fontSize: '0.8rem', color: 'white' }}>ver {packagejson.version}</span>
            </div>

        </div>
    }
}




export default TopNavBar