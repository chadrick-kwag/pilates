import React, { useState } from 'react'


import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, DialogActions, DialogContent } from '@material-ui/core'

import NormalLessonDetailModalBaseView from './NormalLessonDetailModalBaseView'
import NormalLessonDetailEditView from './NormalLessonDetailEditView/main'
import EditAttendance from './EditAttendance'
import PT from 'prop-types'



function NormalLessonDetailModal({ indomain_id, onClose, onCloseAndRefresh }) {

    const [viewMode, setViewMode] = useState('base')


    return (

        <Dialog open={true} onClose={onClose}>
            {(() => {
                if (viewMode === 'base') {
                    return <NormalLessonDetailModalBaseView indomain_id={indomain_id}
                        onClose={onClose} onCloseAndRefresh={onCloseAndRefresh}
                        onEdit={() => setViewMode('edit')}
                        onChangeAttendance={() => {
                            console.log('debug')
                            setViewMode('edit-attendance')
                        }}

                    />
                }
                if (viewMode === 'edit') {
                    return <NormalLessonDetailEditView lessonid={indomain_id} onCancel={() => setViewMode('base')} onEditDone={() => onCloseAndRefresh?.()} />
                }
                if (viewMode === 'edit-attendance') {
                    return <EditAttendance onCancel={() => setViewMode('base')} onSuccess={() => setViewMode('base')} lessonid={indomain_id} />
                }

            })()}

        </Dialog>
    )
}

NormalLessonDetailModal.propTypes = {
    indomain_id: PT.number.isRequired,
    onClose: PT.func.isRequired,
    onCloseAndRefresh: PT.func.isRequired
}

export default NormalLessonDetailModal