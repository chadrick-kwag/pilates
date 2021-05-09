import React, { useState } from 'react'

import { Dialog } from '@material-ui/core'


import ReadOnlyView from './ReadOnlyView'

export default function Container(props) {

    const [mode, setMode] = useState('readonlyview')

    return (
        <Dialog onClose={() => props.onCancel?.()} open={true}>
            {(() => {
                if (mode === 'readonlyview') {
                    return <ReadOnlyView planid={props.planid} />
                }
                else {
                    return <div>unimplemented</div>
                }
            })()}

        </Dialog>
    )
}