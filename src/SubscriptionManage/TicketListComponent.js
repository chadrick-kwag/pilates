import React, { useState } from 'react'
import TicketList from './TicketList'
import EditTicketList from './EditTicketList'
import { Button } from 'react-bootstrap'

export default function TicketListComponent(props) {

    const [editmode, setEditMode] = useState(false)

    return <div>
        {!editmode ?
            <div>

                <div className='row-gravity-right'>
                    <Button onClick={_ => setEditMode(true)}>변경</Button>
                </div>

                <div>
                    <TicketList tickets={props.tickets} refreshdata={props.refreshdata} />
                </div>
            </div>
            :
            <div>
                <EditTicketList tickets={props.tickets} onEscapeEditMode={()=>setEditMode(false)} refreshdata={props.refreshdata} />
            </div>}



    </div>

}

