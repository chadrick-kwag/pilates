import React, {useState} from 'react' 
import CreateApprenticeComponent from './CreateApprenticeCourseComponent'

import ListApprenticeCourseComponent from './ListApprenticeCourseComponent'

export default function ApprenticeCoursePage(props){

    const [viewmode, setViewMode] = useState('list')

    console.log(`viewmode: ${viewmode}`)

    return (
        <>
            {viewmode === 'list' ? <ListApprenticeCourseComponent onCreateCourse={()=>setViewMode('create')} /> : <CreateApprenticeComponent onCancel={()=>setViewMode('list')}
            onSuccess={()=> setViewMode('list')}
            />}
            
        </>
    )
}