import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

export default function PanelSequenceComponent(props) {

    const [pageno, setPageNo] = useState(0)

    return (
        <div>
            <div className='row-gravity-between'>
                <Button onClick={_ => setPageNo(pageno - 1 < 0 ? pageno : pageno - 1)}>prev</Button>
                <Button onClick={_ => setPageNo(pageno + 1 >= props.children.length ? pageno : pageno + 1)} >next</Button>
            </div>

            {props.children.map( (d, i) => {
                let _display

                if (i === pageno) {
                    _display = 'inline'
                }
                else {
                    _display = 'none'
                }
                return <div style={{ display: _display }}>
                    {d}
                </div>
            })}

        </div>
    )
}