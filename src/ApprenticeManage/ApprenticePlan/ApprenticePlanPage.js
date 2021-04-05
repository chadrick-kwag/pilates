import React, { useState } from 'react'
import ListPlanComponent from './ListPlanComponent'
import CreateApprenticeComponent from './CreateApprenticePlanComponent'


export default function ApprenticePlanPage(props) {

    const [viewMode, setViewMode] = useState('list')

    return (
        <>
            {viewMode === 'list' ? <ListPlanComponent
                onCreate={() => setViewMode('create')}
            /> : <CreateApprenticeComponent
                onCancel={() => setViewMode('list')}
                onSuccess={() => setViewMode('list')}
            />}
        </>
    )
}