import React, { useState } from 'react'

import { Dialog, DialogActions, Button, DialogContent, TextField } from '@material-ui/core'


import client from '../../../apolloclient'

import { ADD_TICKETS } from '../../../common/gql_defs'


import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

export default function AddTicketDialog(props) {

    const [addCount, setAddCount] = useState(null)
    const [expireDate, setExpireDate] = useState(new Date())
    const [percost, setPerCost] = useState(null)

    const check_okay_to_request_add_tickets = () => {

        // check inputs
        if (props.planid === null || props.planid === undefined) {
            console.log('planid is invalid')
            return false
        }

        if (addCount === null) {
            console.log('addcout is null')
            return false
        }

        if (addCount < 1) {
            console.log('add count is <1')
            return false
        }

        if (expireDate === null) {
            console.log('exire date is null')
            return false
        }

        if (percost === null) {
            return false
        }

        if (percost < 0) {
            return false
        }

        return true

    }

    const request_add_tickets = () => {

        const _var = {
            planid: props.planid,
            addsize: addCount,
            expire_datetime: expireDate.toUTCString(),
            per_ticket_cost: percost
        }

        console.log('var')
        console.log(_var)


        client.mutate({
            mutation: ADD_TICKETS,
            variables: _var,
            fetchPolicy: 'no-cache'

        }).then(res => {
            console.log(res)
            if (res.data.add_tickets.success) {
                props.onSuccess?.()
            }
            else {
                alert(`add tickets failed. msg: ${res.data.add_tickets.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('add tickets error')
        })
    }

    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>
            <DialogContent>
                <div className='row-gravity-left children-padding'>
                    <span>추가할 횟수</span>
                    <TextField value={addCount} onChange={e => {
                        let out = parseInt(e.target.value)

                        if (!isNaN(out)) {
                            setAddCount(out)
                        }
                    }}></TextField>

                </div>
                <div className='row-gravity-left children-padding'>
                    <span>만료일</span>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                        <DatePicker
                            autoOk
                            value={expireDate}
                            onChange={e => setExpireDate(e)}
                        />
                    </MuiPickersUtilsProvider>
                </div>

                <div className='row-gravity-left children-padding'>
                    <span>회당 가격</span>
                    <TextField value={percost} onChange={e => {
                        let out = parseInt(e.target.value)

                        if (!isNaN(out)) {
                            setPerCost(out)
                        }
                    }
                    } />
                </div>


            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>취소</Button>
                <Button disabled={!check_okay_to_request_add_tickets()} onClick={() => request_add_tickets()}>생성</Button>
            </DialogActions>
        </Dialog>
    )

}