import React, { useState } from 'react'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box } from '@material-ui/core'

import ClientSearchComponent3 from '../../../components/ClientSearchComponent3'

export default function AddClientView(props) {

    const [selectedClient, setSelectedClient] = useState(null)


    const reformat_client = (c) => {
        const out = {}
        out.clientname = c.name,
            out.clientphonenumber = c.phonenumber
        out.clientid = c.id

        return out
    }

    return (
        <>
            <DialogContent>
                <ClientSearchComponent3 clientSelectedCallback={d => {
                    console.log(d)
                    setSelectedClient(d)
                }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={e => props.onCancel?.()}>이전으로</Button>
                <Button disabled={selectedClient === null} onClick={e => props.onDone?.(reformat_client(selectedClient))}>완료</Button>
            </DialogActions>
        </>
    )
}