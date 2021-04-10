import React, { useState } from 'react'

import { Table, TableCell, TableRow, TableHead, TableBody, Button, Dialog, DialogContent, TextField, DialogActions } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { DateTime } from 'luxon'
import { DatePicker } from "@material-ui/pickers";
import ApprenticeInstructorSearchComponent from '../../components/ApprenticeInstructorSearchComponent'

import { ADD_APPRENTICE_TICKET_TO_PLAN, CHANGE_EXPIRE_TIME_OF_APPRENTICE_TICKETS, TRANSFER_APPRENTICE_TICKETS_TO_APPRENTICE } from '../../common/gql_defs'
import client from '../../apolloclient'


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
    const [showTransferDialog, setShowTransferDialog] = useState(false)
    const [addTicketCount, setAddTicketCount] = useState(0)
    const [changeExpireDate, setChangeExpireDate] = useState(new Date())
    const [transferReceiver, setTransferReceiver] = useState(null)


    const submit = () => {

    }

    const request_ticket_add = () => {

        // check input
        const amount = parseInt(addTicketCount)
        if (amount <= 0 || amount === null || amount === undefined) {
            alert('invalid ticket count')
            return
        }

        let _var = {
            id: props.planid,
            amount: amount
        }

        console.log(_var)


        client.mutate({
            mutation: ADD_APPRENTICE_TICKET_TO_PLAN,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.add_apprentice_tickets_to_plan.success) {
                props.refreshTickets?.()
                setAddTicketCount(null)
                setShowAddTicketDialog(false)
            }
            else {
                alert('add ticket failed')
                setAddTicketCount(null)
                setShowAddTicketDialog(false)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('add ticket error')
        })
    }

    const request_ticket_transfer = () => {

        if (transferReceiver === null) {
            alert('no transfer receiver')
            return
        }

        if (selectedArr === null || selectedArr.length === 0) {
            alert('no selected tickets')
            return
        }

        const _var = {
            id_arr: selectedArr,
            apprentice_id: transferReceiver.id
        }

        console.log(_var)

        client.mutate({
            mutation: TRANSFER_APPRENTICE_TICKETS_TO_APPRENTICE,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.transfer_apprentice_tickets_to_apprentice.success) {
                props.refreshTickets?.()
                setTransferReceiver(null)
                setShowTransferDialog(false)
            }
            else {
                alert('ticket transfer fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            alert('ticket transfer error')
        })
    }

    const request_ticket_expire_time_change = () => {
        // check input
        if (changeExpireDate === null) {
            alert('invalid expire date')
            return
        }

        if (selectedArr === null || selectedArr.length === 0) {
            alert('invalid selection')
            return
        }


        client.mutate({
            mutation: CHANGE_EXPIRE_TIME_OF_APPRENTICE_TICKETS,
            variables: {
                id_arr: selectedArr,
                new_expire_time: changeExpireDate.toUTCString()
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.change_expire_time_of_apprentice_tickets.success) {
                props.refreshTickets?.()
                setShowChangeExpireTimeDialog(false)
            }
            else {
                alert('change expire time fail')

            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            alert('change expire time error')

        })




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
                <Button variant='outlined' disabled={!at_least_one_selected()} onClick={e => setShowTransferDialog(true)}>양도</Button>
                <Button variant='outlined' disabled={!at_least_one_selected()} onClick={e => setShowChangeExpireTimeDialog(true)}>만료기한 변경</Button>
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
                    <Button onClick={e => request_ticket_add()}>완료</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showTransferDialog} onClose={() => setShowTransferDialog(false)}>
                <DialogContent>
                    <div>
                        <span>양도받을 견습강사</span>
                        <ApprenticeInstructorSearchComponent onSelect={d => setTransferReceiver(d)} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' onClick={e => {
                        setShowTransferDialog(false)
                    }}>취소</Button>
                    <Button onClick={e => request_ticket_transfer()}>완료</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showChangeExpireTimeDialog} onClose={() => setShowChangeExpireTimeDialog(false)}>
                <DialogContent>
                    <DatePicker
                        autoOk
                        orientation="landscape"
                        variant="static"
                        openTo="date"
                        value={changeExpireDate}
                        onChange={e => {
                            console.log(e)
                            setChangeExpireDate(e)
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' onClick={e => {
                        setShowChangeExpireTimeDialog(false)
                    }}>취소</Button>
                    <Button onClick={e => request_ticket_expire_time_change()}>완료</Button>
                </DialogActions>
            </Dialog>

        </div>

    )

}