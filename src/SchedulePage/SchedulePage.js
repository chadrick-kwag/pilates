import React, { useRef, useState } from 'react'

import { Button, Menu, MenuItem } from '@material-ui/core'

import './schedulepage.css'


import ClientScheduleViewer from './ClientScheduleView/ClientScheduleViewer'
import InstructorScheduleViewer from './InstructorScheduleView/InstructorScheduleViewer'
import CreateNormalLessonPage from './CreateNormalLessonView/CreateNormalLessonPage'

import ScheduleViewer from './AllScheduleView/ScheduleViewer'
import CreateApprenticeLesson from './CreateApprenticeLesson'
import CreateSpecialSchedule from './CreateSpecialScheduleView/container'
import CoreAdminUserCheck from '../components/CoreAdminUserCheck'
import { withRouter, Switch, Route } from 'react-router-dom'
import client from '../apolloclient'

import CreateOtherSchedule from './CreateSpecialScheduleView/container'


function MainPage({ history, match }) {

    const menuRef = useRef(null)
    const [showMenu, setShowMenu] = useState(false)

    return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <Switch>
            <Route path={`${match.url}/create/normal-lesson`}>
                <CreateNormalLessonPage />
            </Route>
            <Route path={`${match.url}/create/apprentice-leading-lesson`}>
                <CreateApprenticeLesson />
            </Route>
            <Route path={`${match.url}/create/apprentice-teaching-lesson`}>
                <div>hello</div>
            </Route>
            <Route path={`${match.url}/create/etc-schedule`}>
                <CreateOtherSchedule />
            </Route>
            <Route >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button ref={menuRef} variant='contained' onClick={() => setShowMenu(true)}>수업등록</Button>
                    <Menu open={showMenu} anchorEl={menuRef?.current} onClose={() => setShowMenu(false)}>
                        <MenuItem onClick={() => {
                            setShowMenu(false)
                            history.push('/schedule/create/normal-lesson')
                        }}>일반 수업</MenuItem>
                        <MenuItem onClick={() => {
                            setShowMenu(false)
                            history.push('/schedule/create/apprentice-leading-lesson')
                        }}>견습 주도수업</MenuItem>
                        <MenuItem onClick={() => {
                            setShowMenu(false)
                            history.push('/schedule/create/apprentice-teaching-lesson')
                        }}>지도자과정 수업</MenuItem>
                        <MenuItem onClick={() => {
                            setShowMenu(false)
                            history.push('/schedule/create/etc-schedule')
                        }}>기타일정</MenuItem>
                    </Menu>
                </div>
                <div>
                    <ScheduleViewer apolloclient={client} />
                </div>
            </Route>
        </Switch>
    </div>
}


export default withRouter(MainPage)
