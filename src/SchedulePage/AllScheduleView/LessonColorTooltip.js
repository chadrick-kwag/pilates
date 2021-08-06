import React from 'react'

import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PILATES_BGCOLOR, GYROTONIC_BGCOLOR, BALLET_BGCOLOR, GYROKINESIS_BGCOLOR, BORDER_GROUP, BORDER_SEMI, BORDER_INDIVIDUAL, INDIVIDUAL_BGCOLOR, SEMI_BGCOLOR, GROUP_BGCOLOR, BORDER_PILATES, BORDER_GYROKINESIS, BORDER_GYROTONIC, BORDER_BALLET } from '../common'

import InfoIcon from '@material-ui/icons/Info';


export default function LessonColorToolTip(props) {


    return <OverlayTrigger

        placement='bottom'
        overlay={<Tooltip >
            <div className='col-gravity-left'>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_PILATES }}></div>
                    <span>필라테스</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_GYROTONIC }}></div>
                    <span>자이로토닉</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_BALLET }}></div>
                    <span>발레</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_GYROKINESIS }}></div>
                    <span>자이로키네시스</span>
                </div>

                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: INDIVIDUAL_BGCOLOR }}></div>
                    <span>개별</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: SEMI_BGCOLOR }}></div>
                    <span>세미</span>
                </div>
                <div className='row-gravity-left'>
                    <div style={{ width: '10px', height: '10px', backgroundColor: GROUP_BGCOLOR }}></div>
                    <span>그룹</span>
                </div>

            </div>
        </Tooltip>} >
        <InfoIcon style={{ marginRight: '0.5rem' }} />
    </OverlayTrigger>


}