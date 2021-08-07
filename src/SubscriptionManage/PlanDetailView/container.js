import React, { useState } from 'react'

import { Dialog } from '@material-ui/core'


import ReadOnlyView from './ReadOnlyView'
import BasicEditView from './BasicInfoEditView/container'
import TicketEditView from './TicketEditView/container'
import { withRouter } from 'react-router-dom'
import client from '../../apolloclient'
import PT from 'prop-types'


function Container({ history, match }) {

    console.log(match)

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
        <div >
            {(() => {
                if (mode === 'readonlyview') {
                    return <ReadOnlyView planid={parseInt(match.params.id)} onCancel={() => refresh_safe_cancel()} onBasicEdit={() => setMode('basic_edit')} onTicketEdit={() => setMode('ticket_edit')} setEditData={setEditData} onDeleteSuccess={() => props.onRefreshClose?.()} />
                }
                else if (mode === 'basic_edit') {
                    return <BasicEditView onCancel={() => setMode('readonlyview')} planid={parseInt(match.params.id)} editData={editData} onEditSuccess={() => {
                        setEditOccured(true)
                        setMode('readonlyview')
                        setEditData(null)
                    }} />
                }
                else if (mode === 'ticket_edit') {
                    return <TicketEditView planid={parseInt(match.params.id)} onCancel={() => setMode('readonlyview')} onEditSuccess={() => setEditOccured(true)} />
                }
                else {
                    return <div>unimplemented</div>
                }
            })()}

        </div>
    )
}

// Container.propTypes = {

// }


export default withRouter(Container)