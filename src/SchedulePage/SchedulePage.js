import React from 'react'
import {Button} from 'react-bootstrap'

import './schedulepage.css'
import ScheduleViewer from './ScheduleViewer'


class SchedulePage extends React.Component{

    constructor(props){
        super(props)
        this.state={
            viewmode: "all"
        }
    }

    render(){


        let mainview = null

        if(this.state.viewmode=="all"){
            mainview = <ScheduleViewer />
        }

        return <div>
            <div className="topbar-container">
                <div className={this.state.viewmode=="all" ? "topbar-selected topbar-item" : "topbar-notselected topbar-item"} onClick={e=>this.setState({
                    viewmode: "all"
                })}>전체보기</div>
                <div className={this.state.viewmode=="instructor" ? "topbar-selected topbar-item" : " topbar-notselected topbar-item"} onClick={e=>this.setState({
                    viewmode: "instructor"
                })}>강사별보기</div>
                <div className={this.state.viewmode=="client" ? "topbar-selected topbar-item" : "topbar-notselected topbar-item"} onClick={e=>this.setState({
                    viewmode: "client"
                })}>회원별보기</div>
            </div>

            {mainview}



        </div>
    }
}

export default SchedulePage