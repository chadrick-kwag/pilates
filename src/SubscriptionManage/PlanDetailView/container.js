import React, { useState } from 'react'

import { Dialog } from '@material-ui/core'


import ReadOnlyView from './ReadOnlyView'
import BasicEditView from './BasicInfoEditView/container'

export default function Container(props) {

    const [mode, setMode] = useState('readonlyview')
    const [editData, setEditData] = useState(null)
    const [editOccured, setEditOccured] = useState(false)

    const refresh_safe_cancel = () => {
        if (editOccured) {
            props.onRefreshClose?.()
        }
        else {
            props.onCancel?.()
        }
    }

    return (
        <Dialog onClose={() => refresh_safe_cancel()} open={true}>
            {(() => {
                if (mode === 'readonlyview') {
                    return <ReadOnlyView planid={props.planid} onCancel={() => refresh_safe_cancel()} onBasicEdit={() => setMode('basic_edit')} onTicketEdit={() => setMode('ticket_edit')} setEditData={setEditData} onDeleteSuccess={() => props.onRefreshClose?.()} />
                }
                else if (mode === 'basic_edit') {
                    return <BasicEditView onCancel={() => setMode('readonlyview')} planid={props.planid} editData={editData} onEditSuccess={() => {
                        setEditOccured(true)
                        setMode('readonlyview')
                        setEditData(null)
                    }} />
                }
                else if (mode === 'ticket_edit') {
                    return <div>hello</div>
                }
                else {
                    return <div>unimplemented</div>
                }
            })()}

        </Dialog>
    )
}