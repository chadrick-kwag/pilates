import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

export default function PanelSequenceComponent(props) {

    const [pageno, setPageNo] = useState(0)

    const prev_default_action = (e) => {
        console.log('prev_default_action')
        console.log(pageno)
        setPageNo(pageno - 1 < 0 ? pageno : pageno - 1)
    }

    const next_default_action = (e) => {
        console.log('next_default_action')
        console.log(pageno)
        console.log(props.children.length)
        setPageNo(pageno + 1 >= props.children.length ? pageno : pageno + 1)
    }


    return (
        <div>
            <div>
            {props.children.map((d, i) => {
                let panel_display = i === pageno ? 'inline' : 'none'
                let prevbtn_display = d.props.prevBtnHide === true ? 'none' : 'inline'
                let nextbtn_display = d.props.nextBtnHide === true ? 'none' : 'inline'

                let topbar_flex_classname = 'row-gravity-between'

                if (d.props.prevBtnHide !== true && d.props.nextBtnHide !== true) {
                    topbar_flex_classname = 'row-gravity-between'
                }
                else if (d.props.prevBtnHide !== true) {
                    topbar_flex_classname = 'row-gravity-left'
                }
                else if (d.props.nextBtnHide !== true) {
                    topbar_flex_classname = 'row-gravity-right'
                }

                return (
                    <div style={{ display: panel_display }}>
                        <div className={topbar_flex_classname}>
                            <Button style={{ display: prevbtn_display }} onClick={e => {
                                if (d.props.prevBtnClick) {
                                    let ret = d.props.prevBtnClick()

                                    if (ret) {
                                        prev_default_action()
                                    }
                                }
                                else {
                                    prev_default_action()
                                }
                            }} >{d.props.prevBtnText ? d.props.prevBtnText : 'prev'}</Button>

                            <Button
                                style={{
                                    display: nextbtn_display
                                }}
                                onClick={e => {
                                    if (d.props.nextBtnClick) {
                                        let ret = d.props.nextBtnClick()
                                        if (ret) {
                                            next_default_action()
                                        }
                                    }
                                    else {
                                        next_default_action()
                                    }
                                }}>{d.props.nextBtnText ? d.props.nextBtnText : 'next'}</Button>
                        </div>
                        <div>
                            {d}
                        </div>
                    </div>
                )
            })}
            </div>
            <div className='row-gravity-center' style={{
                marginTop: '1rem'
            }}>
                <Button onClick={e=>props.onClose?.()}>close</Button>
            </div>
           

        </div>
    )
}

export function PanelSequenceChild(props) {

    return <div>
        {props.children}
    </div>
}