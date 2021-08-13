import React, { useState } from 'react'
import MenuIcon from '@material-ui/icons/Menu';
import { Drawer, List, ListItem } from '@material-ui/core'

function MainFrame({ children }) {

    const [shownav, setshownav] = useState(false);
    return (
        <div className='fwh flex mh100'>
            <Drawer anchor='left' open={shownav} onClose={() => setshownav(false)} >
                <List >
                    <ListItem button>내 정보</ListItem>
                    <ListItem button>스케쥴</ListItem>
                    <ListItem button>수업이력</ListItem>
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


export default MainFrame
