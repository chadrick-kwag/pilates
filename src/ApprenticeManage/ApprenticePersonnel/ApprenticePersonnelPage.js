import React, { useState, useEffect } from 'react'
import ListPersonnelComponent from './ListPersonnelComponent'
import CreateApprenticeComponent from './CreateApprenticeComponent'

export default function ApprenticePersonnelPage(props) {

    const [viewmode, setViewMode] = useState('list')

    return (
        <div>
            
            {viewmode === 'list' ? <ListPersonnelComponent onCreateApprentice={()=>setViewMode('create')}/> : <CreateApprenticeComponent onCancel={()=>setViewMode('list')} 
            onSuccess={()=>setViewMode('list')}
            />}
        </div>
    )
}