import React from 'react'

import { Button, Menu, MenuItem } from '@material-ui/core'

import './schedulepage.css'


import ClientScheduleViewer from './ClientScheduleView/ClientScheduleViewer'
import InstructorScheduleViewer from './InstructorScheduleView/InstructorScheduleViewer'
import CreateNormalLessonPage from './CreateNormalLessonPage'

import ScheduleViewer from './AllScheduleView/ScheduleViewer'
import CreateApprenticeLesson from './CreateApprenticeLesson'


class SchedulePage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "all",
            showCreateLessonMenu: false,
            createLessonMenuAnchor: null
        }

    }

    render() {


        let mainview = null

        if (this.state.viewmode == "all") {
            mainview = <ScheduleViewer apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode == "client") {
            mainview = <ClientScheduleViewer apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode == "instructor") {
            mainview = <InstructorScheduleViewer apolloclient={this.props.apolloclient} />
        }

        else if (this.state.viewmode == "createlesson") {
            

            mainview = <CreateNormalLessonPage onCancel={() => this.setState({
                viewmode: 'all'
            })}
                onSuccess={() => {
                    this.setState({
                        viewmode: 'all'
                    })
                }}
            />
        }
        else if (this.state.viewmode == 'create_apprentice_lesson') {
            mainview = <CreateApprenticeLesson onCancel={() => this.setState({ viewmode: 'all' })} onSuccess={() => this.setState({ viewmode: 'all' })} />
        }

        return <div>
            <div className="topbar-container">
                <div className={this.state.viewmode == "all" ? "topbar-selected topbar-item" : "topbar-notselected topbar-item"} onClick={e => this.setState({
                    viewmode: "all"
                })}>전체보기</div>
                <div className={this.state.viewmode == "instructor" ? "topbar-selected topbar-item" : " topbar-notselected topbar-item"} onClick={e => this.setState({
                    viewmode: "instructor"
                })}>강사별보기</div>
                <div className={this.state.viewmode == "client" ? "topbar-selected topbar-item" : "topbar-notselected topbar-item"} onClick={e => this.setState({
                    viewmode: "client"
                })}>회원별보기</div>
            </div>
            <div>
                <Button variant='contained' color='primary' onClick={e => this.setState({
                    showCreateLessonMenu: true,
                    createLessonMenuAnchor: e.currentTarget
                })}>수업등록</Button>
                <Menu open={this.state.showCreateLessonMenu}
                    anchorEl={this.state.createLessonMenuAnchor}
                    onClose={e => this.setState({ showCreateLessonMenu: false })}>
                    <MenuItem onClick={e => {
                        this.setState({
                            showCreateLessonMenu: false,
                            viewmode: "createlesson"
                        })

                    }}>회원수업</MenuItem>
                    <MenuItem onClick={e => this.setState({
                        viewmode: 'create_apprentice_lesson',
                        showCreateLessonMenu: false
                    })}>견습강사수업</MenuItem>
                </Menu>
            </div>

            {mainview}



        </div >
    }
}

export default SchedulePage