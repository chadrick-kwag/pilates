import React, { useState } from 'react'


import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, DialogActions, DialogContent } from '@material-ui/core'

import NormalLessonDetailModalBaseView from './NormalLessonDetailModalBaseView'
import NormalLessonDetailEditView from './NormalLessonDetailEditView/NormalLessonDetailEditView'


export default function NormalLessonDetailModal(props) {

    const [viewMode, setViewMode] = useState('base')

    return (

        <Dialog open={props.open} onClose={props.onClose}>
            {(() => {
                if (viewMode === 'base') {
                    return <NormalLessonDetailModalBaseView {...props} onEdit={() => setViewMode('edit')}  />
                }
                if (viewMode === 'edit') {
                    return <NormalLessonDetailEditView {...props} onCancel={() => setViewMode('base')} onEditDone={() => props.onCloseAndRefresh?.()}/>
                }

            })()}

        </Dialog>
    )
}