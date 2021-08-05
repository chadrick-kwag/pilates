import React, { useState } from 'react'


import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, DialogActions, DialogContent } from '@material-ui/core'

import NormalLessonDetailModalBaseView from './NormalLessonDetailModalBaseView'
import NormalLessonDetailEditView from './NormalLessonDetailEditView/main'
import EditAttendance from './EditAttendance'



export default function NormalLessonDetailModal(props) {

    console.log('props')
    console.log(props)

    console.log('props.data.indomin_id')
    console.log(props.data.indomain_id)

    const [viewMode, setViewMode] = useState('base')

    return (

        <Dialog open={props.open} onClose={props.onClose}>
            {(() => {
                if (viewMode === 'base') {
                    return <NormalLessonDetailModalBaseView {...props} onEdit={() => setViewMode('edit')} onChangeAttendance={() => {
                        console.log('debug')
                        setViewMode('edit-attendance')
                    }} />
                }
                if (viewMode === 'edit') {
                    return <NormalLessonDetailEditView {...props} onCancel={() => setViewMode('base')} onEditDone={() => props.onCloseAndRefresh?.()} />
                }
                if (viewMode === 'edit-attendance') {
                    return <EditAttendance onCancel={() => setViewMode('base')} onSuccess={() => setViewMode('base')} lessonid={props.data.indomain_id} />
                }

            })()}

        </Dialog>
    )
}