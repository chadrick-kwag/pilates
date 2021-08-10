import React from 'react'
import MenuIcon from '@material-ui/icons/Menu';

function MainFrame({ children }) {
    return (
        <div className='fwh flex mh100'>
            <div className="flex flex-row jc ac" style={{ width: '40px', height: '40px', position: 'sticky', backgroundColor: '#c2c2c2', top: '1rem', left: '1rem', borderRadius: '20px' }}>
                <MenuIcon />
            </div>
            {children}
        </div>
    )
}


export default MainFrame
