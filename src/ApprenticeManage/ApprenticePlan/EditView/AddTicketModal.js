import React, { useState } from 'react'
import { Table, TableRow, TableCell, Dialog, DialogContent, DialogActions, Button, TextField, OutlinedInput, Input, InputAdornment, CircularProgress } from '@material-ui/core'
import client from '../../apolloclient'
import { useMutation } from '@apollo/client'
import { ADD_TICKETS } from '../../common/gql_defs'
import { DateTime } from 'luxon'
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import PT from 'prop-types'


function AddTicketDialog({ onClose, onSuccess, planid }) {

    const [count, setCount] = useState(null)
    const [perCost, setPerCost] = useState(null)
    const [expireDate, setExpireDate] = useState((() => new Date())())
    const [addTickets, { loading, data, error }] = useMutation(ADD_TICKETS, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.add_tickets?.success) {
                onSuccess?.()
            }
            else {
                alert('추가 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('추가 에러')
        }
    })

    const is_submit_disabled = () => {
        if (count === null || perCost === null) return true

        if (parseInt(count) <= 0) return true

        if (parseInt(perCost) <= 0) return true

        return false
    }

    return <Dialog open={true} onClose={onClose}>

        <DialogContent>

            <Table>
                <TableRow>
                    <TableCell>
                        횟수
                    </TableCell>
                    <TableCell>
                        {/* <TextField variant='outlined' value={count} onChange={e => setCount(e.target.value)} /> */}
                        <OutlinedInput variant='outlined' value={count} onChange={e => setCount(e.target.value)}
                            endAdornment={<InputAdornment position='end'>회</InputAdornment>}
                        />


                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        회당가격
                    </TableCell>
                    <TableCell>
                        <OutlinedInput variant='outlined' value={perCost} onChange={e => setPerCost(e.target.value)}
                            endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                        />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        만료일
                    </TableCell>
                    <TableCell>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                            <DatePicker
                                autoOk
                                value={expireDate}
                                onChange={e => setExpireDate(e)}

                            />
                        </MuiPickersUtilsProvider>
                    </TableCell>
                </TableRow>
            </Table>


        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={() => onClose()}>취소</Button>
            <Button variant='outlined' disabled={is_submit_disabled()} onClick={() => addTickets({
                variables: {
                    planid,
                    addsize: parseInt(count),
                    expire_datetime: DateTime.fromJSDate(expireDate).setZone('utc+9').endOf('day').toHTTP(),
                    per_ticket_cost: parseInt(perCost)
                }
            })}>{loading ? <CircularProgress size='20' /> : '생성'}</Button>
        </DialogActions>

    </Dialog>
}


AddTicketDialog.propTypes = {
    onClose: PT.func,
    onSuccess: PT.func,
    planid: PT.number
}

export default AddTicketDialog