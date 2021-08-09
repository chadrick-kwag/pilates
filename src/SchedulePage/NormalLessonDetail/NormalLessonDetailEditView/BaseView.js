import React, { useEffect, useState } from 'react'


import { DateTime } from 'luxon'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, DialogActions, Chip, DialogContent, Select, Box, CircularProgress } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../../common/consts'


import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import CachedIcon from '@material-ui/icons/Cached';
import ClientTicketChip from './ClientTicketChip'


export default function BaseView(props) {


    const check_request_possible = () => {

        console.log('props.clientsAndTickets')
        console.log(props.clientsAndTickets)


        if (props.clientsAndTickets === null || props.clientsAndTickets === undefined) {
            return false
        }

        // if durationHours is zero, then something is wrong
        if (props.durationHours < 1) {
            return false
        }

        // add least one client should exist
        if (props.clientsAndTickets.length < 1) {
            return false
        }

        // for each client, the assigned ticket count should match durationHours
        const durationHours = props.durationHours
        for (let i = 0; i < props.clientsAndTickets.length; i++) {
            const ct = props.clientsAndTickets[i]

            console.log(ct)

            if (ct.ticketid_arr?.length !== durationHours) {
                console.log(`duration: ${durationHours}, tickets length: ${ct.ticketid_arr.length}`)
                return false
            }

        }

        return true

    }

    if (props.clientsAndTickets === null) {
        return (
            <>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </>
        )
    }
    else {

        return (
            <>
                <DialogContent>

                    <Table>
                        <TableRow>
                            <TableCell>강사</TableCell>
                            <TableCell>
                                <Chip label={`${props.instructor.name}(${props.instructor.phonenumber})`} deleteIcon={<CachedIcon />}
                                    onDelete={e => props.onChangeInstructor?.()} />

                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>회원</TableCell>
                            <TableCell>
                                <Box>
                                    {props.clientsAndTickets.map((d, i) => <ClientTicketChip name={d.clientname} slotTotal={props.durationHours}
                                        phonenumber={d.clientphonenumber}
                                        tickets={d.ticketid_arr}
                                        onEditClientTickets={() => {
                                            props.switchToClientTicketEditMode(i)
                                        }}
                                        onDeleteClientTickets={() => {
                                            let new_client_tickets = [...props.clientsAndTickets]

                                            // remove client

                                            new_client_tickets.splice(i, 1)

                                            props.setClientsAndTickets(new_client_tickets)

                                        }}
                                    />)}

                                    {(() => {
                                        if (props.grouping_type === 'INDIVIDUAL' && props.clientsAndTickets.length < 1) {
                                            return <Chip label='추가' onClick={e => props.onAddClient?.()} />
                                        }

                                        if (props.grouping_type === 'SEMI' && props.clientsAndTickets.length < 2) {
                                            return <Chip label='추가' onClick={e => props.onAddClient?.()} />
                                        }

                                        if (props.grouping_type === 'GROUP') {
                                            return <Chip label='추가' onClick={e => props.onAddClient?.()} />
                                        }
                                    })()}

                                </Box>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                수업종류
                            </TableCell>
                            <TableCell>
                                <span style={{ color: 'gray' }}>{activity_type_to_kor[props.activity_type]}/{grouping_type_to_kor[props.grouping_type]}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                수업시간
                            </TableCell>
                            <TableCell>
                                <div className='row-gravity-center children-padding'>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                        <DateTimePicker
                                            variant="inline"

                                            value={props.startTime}
                                            onChange={e => {
                                                props.setStartTime(DateTime.fromJSDate(e))
                                            }}
                                            minutesStep={15}
                                            ampm={false}
                                        />
                                    </MuiPickersUtilsProvider>
                                    <div>
                                        <span>길이</span>
                                        <Select value={props.durationHours} renderValue={v => {
                                            console.log(v)
                                            return v + '시간'
                                        }} onChange={e => props.setDurationHours(e.target.value)}>
                                            {(() => {
                                                const out = []
                                                for (let i = 1; i < 9; i++) {
                                                    out.push(<MenuItem value={i} >{i}시간</MenuItem>)
                                                }
                                                return out
                                            })().map(d => d)}
                                        </Select>
                                    </div>
                                </div>


                            </TableCell>
                        </TableRow>

                    </Table>

                </DialogContent>
                <DialogActions>


                    <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전으로</Button>
                    <Button variant='outlined' disabled={!check_request_possible()} onClick={e => props.onRequestChange?.()}>변경요청</Button>

                </DialogActions>

            </>
        )
    }
}