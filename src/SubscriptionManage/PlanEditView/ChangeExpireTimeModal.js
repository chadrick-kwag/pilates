import React, { useState } from 'react'
import { Dialog, DialogContent, DialogActions, Button, Grid } from '@material-ui/core'
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'
import client from '../../apolloclient'
import PT from 'prop-types'
import { UPDATE_EXPDATE_OF_TICKETS } from '../../common/gql_defs'
import { useMutation } from '@apollo/client'

function ChangeExpireTimeModal({ onClose, onSuccess, ticketIds }) {

    console.log('ticketIds')
    console.log(ticketIds)


    const [expireDate, setExpireDate] = useState((() => new Date())())

    const [updateExpireDate, { loading, error }] = useMutation(UPDATE_EXPDATE_OF_TICKETS, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.update_expdate_of_tickets?.success) {
                onSuccess?.()
            }
            else {
                alert('변경 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }

    })


    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            <Grid container style={{ alignItems: 'center' }}>
                <Grid item xs={3}>
                    <span>만료일</span>
                </Grid>
                <Grid item xs={9}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                        <DatePicker
                            autoOk
                            value={expireDate}
                            onChange={e => setExpireDate(e)}

                        />
                    </MuiPickersUtilsProvider>
                </Grid>

            </Grid>
        </DialogContent>
        <DialogActions>
            <Button varint='outlined' onClick={onClose}>취소</Button>
            <Button varint='outlined' onClick={() => updateExpireDate({
                variables: {
                    ticket_id_list: ticketIds,
                    new_expdate: DateTime.fromJSDate(expireDate).setZone('utc+9').endOf('day').toHTTP()
                }
            })}>변경</Button>
        </DialogActions>
    </Dialog>
}


ChangeExpireTimeModal.propTypes = {
    onClose: PT.func,
    onSuccess: PT.func,
    ticketIds: PT.arrayOf(PT.number)
}

export default ChangeExpireTimeModal