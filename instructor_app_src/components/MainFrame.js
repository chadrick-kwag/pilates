import React, { useState } from 'react'
import MenuIcon from '@material-ui/icons/Menu';
import { Drawer, List, ListItem, Divider } from '@material-ui/core'
import { withRouter } from 'react-router-dom'

function MainFrame({ history, children }) {

    const [shownav, setshownav] = useState(false);
    return (
        <div className='fwh flex mh100'>
            <Drawer anchor='left' open={shownav} onClose={() => setshownav(false)} >
                <List >
                    <ListItem button onClick={() => {
                        setshownav(false)
                        history.push('/profile')
                    }}>내 정보</ListItem>
                    <ListItem button onClick={() => {
                        setshownav(false)
                        history.push('/')
                    }}>스케쥴</ListItem>
                    <ListItem button onClick={() => {
                        setshownav(false)
                        history.push('/lessonhistory')
                    }}>수업이력</ListItem>

                    <Divider />

                    <ListItem button onClick={() => {
                        // remove token
                        localStorage.removeItem('instructor-auth-token')
                        history.push('/login')
                    }}>로그아웃</ListItem>
                </List>
            </Drawer>
            {(() => {
                if (shownav) {
                    return null
                }

                return <div className="flex flex-row jc ac" style={{ width: '40px', maxHeight: '40px', maxWidth: '40px', height: '40px', position: 'absolute', backgroundColor: '#c2c2c2', top: '0.5rem', left: '0.5rem', borderRadius: '20px', zIndex: 999 }}>
                    <MenuIcon onClick={() => setshownav(!shownav)} />
                </div>
            })()}

            {children}
        </div>
    )
}


export default withRouter(MainFrame)
