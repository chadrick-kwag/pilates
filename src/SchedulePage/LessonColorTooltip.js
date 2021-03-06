import React from 'react'

import { Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import { PILATES_BGCOLOR, GYROTONIC_BGCOLOR, BALLET_BGCOLOR, GYROKINESIS_BGCOLOR } from './common'


export default function LessonColorToolTip(props) {

    
    return <OverlayTrigger
        placement='bottom'
        overlay={<Tooltip >
            <div className='col-gravity-left'>
                <div className='row-gravity-left'>
                    <div style={{width: '10px', height: '10px', backgroundColor: PILATES_BGCOLOR}}></div>
                <span>필라테스</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{width: '10px', height: '10px', backgroundColor: GYROTONIC_BGCOLOR}}></div>
                <span>자이로토닉</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{width: '10px', height: '10px', backgroundColor: BALLET_BGCOLOR}}></div>
                <span>발레</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{width: '10px', height: '10px', backgroundColor: GYROKINESIS_BGCOLOR}}></div>
                <span>자이로키네시스</span>
                </div>

            </div>
        </Tooltip>}
    >
        <Button variant='outline-dark'>레슨컬러</Button>
    </OverlayTrigger>

}