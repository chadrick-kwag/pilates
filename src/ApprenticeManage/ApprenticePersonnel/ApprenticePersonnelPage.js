import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import client from '../../apolloclient'
import ListPersonnelComponent from './ListPersonnelComponent'
import CreateApprenticeComponent from './CreateApprenticeComponent'

export default function ApprenticePersonnelPage(props) {

    const [viewmode, setViewMode] = useState('list')

    return (
        <div>
            <h2>견습강사관리</h2>
            

            {viewmode === 'list' ? <ListPersonnelComponent onCreateApprentice={()=>setViewMode('create')}/> : <CreateApprenticeComponent onCancel={()=>setViewMode('list')} />}

        </div>
    )
}