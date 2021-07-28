import React from 'react'

import { Button, Menu, MenuItem } from '@material-ui/core'

import './schedulepage.css'


import ClientScheduleViewer from './ClientScheduleView/ClientScheduleViewer'
import InstructorScheduleViewer from './InstructorScheduleView/InstructorScheduleViewer'
import CreateNormalLessonPage from './CreateNormalLessonView/CreateNormalLessonPage'

import ScheduleViewer from './AllScheduleView/ScheduleViewer'
import CreateApprenticeLesson from './CreateApprenticeLesson'
import CreateSpecialSchedule from './CreateSpecialScheduleView/container'
import CoreAdminUserCheck from '../components/CoreAdminUserCheck'


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

        if (this.state.viewmode === "all") {
            mainview = <ScheduleViewer apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode === "client") {
            mainview = <ClientScheduleViewer apolloclient={this.props.apolloclient} />
        }
        else if (this.state.viewmode === "instructor") {
            mainview = <InstructorScheduleViewer apolloclient={this.props.apolloclient} />
        }

        else if (this.state.viewmode === "createlesson") {


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
        else if (this.state.viewmode === 'create_apprentice_lesson') {
            mainview = <CreateApprenticeLesson onCancel={() => this.setState({ viewmode: 'all' })} onSuccess={() => this.setState({ viewmode: 'all' })} />
        }
        else if (this.state.viewmode === 'create_special_schedule') {
            mainview = <CreateSpecialSchedule onCancel={() => this.setState({ viewmode: 'all' })} onSuccess={() => this.setState({
                viewmode: 'all'
            })}

            />
        }

        return <div>

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
                    <MenuItem onClick={e => this.setState({
                        viewmode: 'create_special_schedule',
                        showCreateLessonMenu: false
                    })}>기타 스케쥴</MenuItem>
                </Menu>


            </div>

            {mainview}



        </div >
    }
}

export default SchedulePage