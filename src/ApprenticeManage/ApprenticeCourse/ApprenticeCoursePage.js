import React, {useState} from 'react' 
import CreateApprenticeComponent from './CreateApprenticeCourseComponent'
import Button from '@material-ui/core/Button';
import ListApprenticeCourseComponent from './ListApprenticeCourseComponent'

export default function ApprenticeCoursePage(props){

    const [viewmode, setViewMode] = useState('list')

    console.log(`viewmode: ${viewmode}`)

    return (
        <div>
            {viewmode === 'list' ? <ListApprenticeCourseComponent onCreateCourse={()=>setViewMode('create')} /> : <CreateApprenticeComponent onCancel={()=>setViewMode('list')}
            onSuccess={()=> setViewMode('list')}
            />}
            
        </div>
    )
}