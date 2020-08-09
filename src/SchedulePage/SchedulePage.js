import React from 'react'
import {Button} from 'react-bootstrap'

import './schedulepage.css'
import ScheduleViewer from './ScheduleViewer'
import CreateLessonPage from './CreateLessonPage'
import ClientScheduleViewer from './ClientScheduleViewer'


class SchedulePage extends React.Component{

    constructor(props){
        super(props)
        this.state={
            viewmode: "all"
        }

        this.createlesson = this.createlesson.bind(this)
    }

    createlesson(){
        this.setState({
            viewmode: "createlesson"
        })
    }

    render(){


        let mainview = null

        if(this.state.viewmode=="all"){
            mainview = <ScheduleViewer apolloclient={this.props.apolloclient}/>
        }
        else if (this.state.viewmode =="client"){
            mainview = <ClientScheduleViewer apolloclient={this.props.apolloclient} />
        }

        else if(this.state.viewmode == "createlesson"){
            mainview = <CreateLessonPage apolloclient={this.props.apolloclient} cancel_callback={()=>{
                this.setState({
                    viewmode: "all"
                })
            }}/>
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
            <div>
                <Button onClick={e=>this.createlesson()}>수업등록</Button>
            </div>

            {mainview}



        </div>
    }
}

export default SchedulePage