import React, {useState} from 'react'
import { Card } from 'react-bootstrap'
import './profilecard.css'
import PhoneIcon from '@material-ui/icons/Phone';
import ClearIcon from '@material-ui/icons/Clear';


export default function PersonProfileCard(props) {

    const [hover, setHover] = useState(false)

    const get_text_color = () => {
        if (props.variant === undefined) {
            return 'dark'
        }
        if (props.variant.toLowerCase() === 'light') {
            return 'dark'
        }

        return 'light'
    }

    return <Card bg={props.variant !== undefined ? props.variant.toLowerCase() : 'light'}
        text={get_text_color()}
        style={props.style}
        onMouseEnter={e=>setHover(true)}
        onMouseLeave={e=>setHoever(false)}
    >

        <div className='hover-container'>
            {hover ? <div className='hover-overlay'>
                <ClearIcon className='hover-cancel-div'/>
                </div> : null}
            <Card.Header style={{ padding: '1px' }}>{props.type}</Card.Header>
            <Card.Body className='col-gravity-center' >

                <Card.Text className='card-name'>{props.name}</Card.Text>
                <Card.Text className="card-normal">
                    <span><PhoneIcon />{props.phonenumber} </span>
                </Card.Text>

            </Card.Body>

        </div>

    </Card>
}