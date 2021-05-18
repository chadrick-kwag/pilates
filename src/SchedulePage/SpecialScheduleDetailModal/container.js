import React, {useState} from 'react'

import { Dialog, DialogContent, DialogActions } from '@material-ui/core'
import ReadOnlyView from './ReadOnlyView'

export default function Container(props) {

    const [mode, setMode] = useState('readonly')



    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>

            {(() => {
                if (mode === 'readonly') {
                    return <ReadOnlyView id={props.id} onCancel={() => props.onClose?.()} onEdit={() => setMode('edit')} />
                }
                else if (mode == 'edit') {
                    return <div>hello</div>
                }
            })()}


        </Dialog>
    )
}

