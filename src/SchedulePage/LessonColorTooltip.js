import React from 'react'

import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PILATES_BGCOLOR, GYROTONIC_BGCOLOR, BALLET_BGCOLOR, GYROKINESIS_BGCOLOR, BORDER_GROUP, BORDER_SEMI, BORDER_INDIVIDUAL } from './common'


export default function LessonColorToolTip(props) {


    return <div className='row-gravity-center'>
        <OverlayTrigger
            placement='bottom'
            overlay={<Tooltip >
                <div className='col-gravity-left'>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: PILATES_BGCOLOR }}></div>
                        <span>필라테스</span>
                    </div>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: GYROTONIC_BGCOLOR }}></div>
                        <span>자이로토닉</span>
                    </div>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: BALLET_BGCOLOR }}></div>
                        <span>발레</span>
                    </div>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: GYROKINESIS_BGCOLOR }}></div>
                        <span>자이로키네시스</span>
                    </div>

                </div>
            </Tooltip>}
        >
            <Button variant='outline-dark'>액티비티컬러</Button>
        </OverlayTrigger>
        <OverlayTrigger
            placement='bottom'
            overlay={<Tooltip >
                <div className='col-gravity-left'>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_INDIVIDUAL }}></div>
                        <span>개별</span>
                    </div>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_SEMI }}></div>
                        <span>세미</span>
                    </div>
                    <div className='row-gravity-left'>
                        <div style={{ width: '10px', height: '10px', backgroundColor: BORDER_GROUP }}></div>
                        <span>그룹</span>
                    </div>
                    

                </div>
            </Tooltip>}
        >
            <Button variant='outline-dark'>그룹컬러</Button>
        </OverlayTrigger>
    </div>

}