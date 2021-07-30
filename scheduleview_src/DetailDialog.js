import React, { useState } from 'react'
import { Dialog, DialogContent, CircularProgress } from '@material-ui/core'

function DetailDialog({ onClose, schedule_info }) {


    const [data, setDate] = useState(null)

    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            {(() => {
                if (data === null) {
                    return <CircularProgress />
                }
            })()}
        </DialogContent>


    </Dialog>

}


export default DetailDialog