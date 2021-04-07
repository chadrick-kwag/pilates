import React, { useState } from 'react'

import { Table, TableCell, TableRow, TableHead, TableBody, Button, Dialog, DialogContent, TextField, DialogActions } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { DateTime } from 'luxon'


const columns = [
    { field: 'id', headerName: 'id', flex: 0.3 },
    { field: 'expire_time', headerName: '만료일시', flex: 1 },
    { field: 'consumed_time', headerName: '소모수업 시작일시', flex: 1 }
]



export default function TicketEdit(props) {
    console.log('props')
    console.log(props)

    const [selectedArr, setSelectedArr] = useState(null)
    const [showAddTicketDialog, setShowAddTicketDialog] = useState(false)
    const [showChangeExpireTimeDialog, setShowChangeExpireTimeDialog] = useState(false)
    const [addTicketCount, setAddTicketCount] = useState(0)


    const submit = () => {

    }

    const transfer_callback = () => {

    }

    const at_least_one_selected = () => {
        if (selectedArr === null) {
            return false;
        }

        if (selectedArr.length > 0) {
            return true;
        }

        return false;
    }

    return (

        <div style={{ width: '100%', height: '100%', display: 'flex', flexFlow: 'column' }}>
            <div className='row-gravity-right' style={{ flex: '0 0 min-content' }}>
                <Button variant='outlined' onClick={() => setShowAddTicketDialog(true)} >추가</Button>
                <Button variant='outlined' disabled={!at_least_one_selected()} onClick={e => transfer_callback()}>양도</Button>
                <Button variant='outlined' disabled={!at_least_one_selected()}>만료기한 변경</Button>
                <Button variant='outlined' disabled={!at_least_one_selected()}>삭제</Button>
            </div>
            <div style={{ display: 'flex', flex: '20 20 500px', width: '100%' }}>
                <DataGrid rows={props.tickets} columns={columns} checkboxSelection onSelectionModelChange={e => {
                    console.log(e)
                    let new_arr = e.selectionModel.map(d => parseInt(d))
                    console.log(new_arr)
                    setSelectedArr(new_arr)
                }} />

            </div>
            <div className='row-gravity-center' style={{ flex: '1 1 min-content', width: '100%' }}>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>변경</Button>
            </div>
            <Dialog open={showAddTicketDialog} onClose={() => setShowAddTicketDialog(false)}>
                <DialogContent>
                    <div className="row-gravity-center">
                        <span>추가횟수</span>
                        <TextField value={addTicketCount} onChange={e => setAddTicketCount(e.target.value)}></TextField>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button color='secondary' onClick={e => {
                        setAddTicketCount(0)
                        setShowAddTicketDialog(false)
                    }}>취소</Button>
                    <Button>완료</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showChangeExpireTimeDialog} onClose={()=>setShowChangeExpireTimeDialog(false)}>
                <DialogContent>

                </DialogContent>
                <DialogActions>
                <Button color='secondary' onClick={e => {
                        
                        setShowChangeExpireTimeDialog(false)
                    }}>취소</Button>
                    <Button>완료</Button>
                </DialogActions>
            </Dialog>

        </div>

    )

}