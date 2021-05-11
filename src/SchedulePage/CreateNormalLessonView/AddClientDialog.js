import React, { useState } from 'react'

import { Dialog, DialogActions, DialogContent, Button } from '@material-ui/core'

import ClientSearchComponent from '../../components/ClientSearchComponent4'


export default function AddClientDialog(props) {

    const [client, setClient] = useState(null)
    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>
            <DialogContent>
                <ClientSearchComponent onClientSelected={p => setClient(p)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>취소</Button>
                <Button disabled={client === null} onClick={() => props.onAddClient(client)}>추가</Button>
            </DialogActions>

        </Dialog>
    )
}