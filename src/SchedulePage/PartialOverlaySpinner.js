import React, { useEffect, useState, useRef } from 'react'
import { Spinner } from 'react-bootstrap'

export default function PartialOverlaySpinner(props) {

    const rootdiv = useRef(null)
    // let rootdiv = null


    const [width, setwidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [offsetleft, setOffsetLeft] = useState(0)
    const [offsetTop, setOffsetTop] = useState(0)

    useEffect(() => {
        console.log('rootdiv')
        console.log(rootdiv)
        if (rootdiv.current !== null) {

            setwidth(rootdiv.current.offsetWidth)
            setHeight(rootdiv.current.offsetHeight)
            setOffsetLeft(rootdiv.current.offsetLeft)
            setOffsetTop(rootdiv.current.offsetTop)

            console.log(width)
            console.log(height)
            console.log(offsetleft)
            console.log(offsetTop)
        }

    })

    console.log('rendering')
    return <div ref={rootdiv} {...props}>
        {props.hide === true ? <div className='row-gravity-center custom-overlay' style={{  width: width, height: height, top: offsetTop, left: offsetleft }}><Spinner animation='border' /></div> : null}

        {props.children}
    </div>
}