import React, { useState, useEffect } from 'react'
import ListPersonnelComponent from './ListPersonnelComponent'
import CreateApprenticeComponent from './CreateApprenticeComponent'
import DetailViewPersonnelComponent from './DetailViewPersonnelComponent'

export default function ApprenticePersonnelPage(props) {

    const [viewmode, setViewMode] = useState('list')
    const [viewPersonnel, setViewPersonnel] = useState(null)

    const getMain = () => {

        if (viewPersonnel !== null) {
            return <DetailViewPersonnelComponent id={viewPersonnel.id} onCancel={() => setViewPersonnel(null)} />
        }
        if (viewmode === 'list') {
            return <ListPersonnelComponent onCreateApprentice={() => setViewMode('create')} onSelectViewPersonnel={a => setViewPersonnel(a)} />
        }
        else if (viewmode === 'create') {
            return <CreateApprenticeComponent onCancel={() => setViewMode('list')}
                onSuccess={() => setViewMode('list')}
            />
        }

        return null
    }

    return getMain()

}