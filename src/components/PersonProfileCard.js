import React from 'react'
import { Card } from 'react-bootstrap'
import './profilecard.css'


export default function PersonProfileCard(props) {

    const get_text_color=()=>{
        if(props.variant === undefined){
            return 'dark'
        }
        if(props.variant.toLowerCase()==='light'){
            return 'dark'
        }

        return 'light'
    }
    
    return <Card bg={props.variant !== undefined ? props.variant.toLowerCase() : 'light'}
    text={get_text_color()}
    style={props.style}
    >
        <Card.Body className='col-gravity-center' >
            <Card.Text  className='card-name'>{props.name}</Card.Text>
            <Card.Text className="card-normal">
                <span>연락처 {props.phonenumber} </span>
            </Card.Text>

        </Card.Body>
    </Card>
}