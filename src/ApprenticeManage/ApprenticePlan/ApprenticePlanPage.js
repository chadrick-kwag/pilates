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
            return <DetailViewComponent id={viewPlan.id} onCancel={() => {
                setViewMode('list')
                setViewPlan(null)
            }} />
        }

        if (viewMode === 'create') {
            return <CreateApprenticeComponent
                onCancel={() => setViewMode('list')}
                onSuccess={() => setViewMode('list')}
            />
        }
        return null
    }

    return (
        <>
            <div style={viewMode === 'list' ? {
                display: 'inherit'
            } : {
                display: 'none'
            }}>
                <ListPlanComponent
                    onCreate={() => setViewMode('create')}
                    onSelect={d => {
                        setViewMode('none')
                        setViewPlan(d)
                    }}
                />
            </div>
            {getView()}
        </>
    )
}