import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'

export default function PartialOverlaySpinner(props) {

    let rootdiv = React.createRef()
    // let rootdiv = null


    const [width, setwidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [offsetleft, setOffsetLeft] = useState(0)
    const [offsetTop, setOffsetTop] = useState(0)

    useEffect(() => {
        // console.log('rootdiv')
        // console.log(rootdiv)
        if (rootdiv !== null) {

            setwidth(rootdiv.offsetWidth)
            setHeight(rootdiv.offsetHeight)
            setOffsetLeft(rootdiv.offsetLeft)
            setOffsetTop(rootdiv.offsetTop)

            console.log(width)
            console.log(height)
            console.log(offsetleft)
            console.log(offsetTop)
        }

    })

    return <div ref={rootdiv} {...props}>
        {props.hide === true ? <div className='row-gravity-center custom-overlay' style={{ width: width, height: height, top: offsetTop, left: offsetleft }}><Spinner animation='border' /></div> : null}

        {props.children}
    </div>
}