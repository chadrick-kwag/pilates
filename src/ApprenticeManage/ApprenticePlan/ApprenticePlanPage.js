import React, { useState } from 'react'
import ListPlanComponent from './ListPlanComponent'
import CreateApprenticeComponent from './CreateApprenticePlanComponent'
import DetailViewComponent from './DetailViewComponent'


export default function ApprenticePlanPage(props) {

    const [viewMode, setViewMode] = useState('list')
    const [viewPlan, setViewPlan] = useState(null)

    const getView = () => {

        if (viewPlan !== null) {
            console.log(viewPlan)
            return <DetailViewComponent id={viewPlan.id} onCancel={() => setViewPlan(null)} />
        }
        if (viewMode === 'list') {
            return <ListPlanComponent
                onCreate={() => setViewMode('create')}
                onSelect={d => setViewPlan(d)}
            />
        }
        else if (viewMode === 'create') {
            return <CreateApprenticeComponent
                onCancel={() => setViewMode('list')}
                onSuccess={() => setViewMode('list')}
            />
        }
        return null
    }

    return (
        <>
            {getView()}
        </>
    )
}