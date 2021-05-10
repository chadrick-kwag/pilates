import React, { useState } from 'react'

import { Dialog, DialogActions, Button, DialogContent } from '@material-ui/core'


import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";


export default function ExpireTimeChangeDialog(props) {

    const [expiredate, setExpiredate] = useState(props.initdate)

    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>
            <DialogContent>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                    <DatePicker
                        autoOk
                        value={expiredate}
                        variant="static"
                        onChange={e => setExpiredate(e)}
                    />
                </MuiPickersUtilsProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>취소</Button>
                <Button disabled={expiredate === null} onClick={() => props.onDone?.(expiredate)}>완료</Button>
            </DialogActions>
        </Dialog>
    )
}