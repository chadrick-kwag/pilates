import React, { useState } from 'react'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box } from '@material-ui/core'

import ClientSearchComponent from '../../../components/ClientSearchComponent4'
import PT from 'prop-types'

function AddClientView({ onCancel, onDone }) {

    const [selectedClient, setSelectedClient] = useState(null)


    // const reformat_client = (c) => {
    //     console.log('reformat_client')
    //     console.log(c)
    //     const out = {}
    //     out.clientname = c.name
    //     out.clientphonenumber = c.phonenumber
    //     out.clientid = c.id


    //     return out
    // }

    return (
        <>
            <DialogContent>
                <ClientSearchComponent onClientSelected={d => {
                    console.log(d)
                    setSelectedClient(d)
                }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={e => onCancel?.()}>이전으로</Button>
                <Button disabled={selectedClient === null} onClick={e => onDone?.(selectedClient)}>완료</Button>
            </DialogActions>
        </>
    )
}


AddClientView.propTypes = {
    onCancel: PT.func,
    onDone: PT.func
}

export default AddClientView