import React, { useState } from 'react'

import { Dialog } from '@material-ui/core'


import ReadOnlyView from './ReadOnlyView'
import BasicEditView from './BasicInfoEditView/container'

export default function Container(props) {

    const [mode, setMode] = useState('readonlyview')
    const [editData, setEditData] = useState(null)

    return (
        <Dialog onClose={() => props.onCancel?.()} open={true}>
            {(() => {
                if (mode === 'readonlyview') {
                    return <ReadOnlyView planid={props.planid} onCancel={props.onCancel} onBasicEdit={() => setMode('basic_edit')} onTicketEdit={() => setMode('ticket_edit')} setEditData={setEditData} />
                }
                else if (mode === 'basic_edit') {
                    return <BasicEditView onCancel={() => setMode('readonlyview')} planid={props.planid} editData={editData} onEditSuccess={() => {
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