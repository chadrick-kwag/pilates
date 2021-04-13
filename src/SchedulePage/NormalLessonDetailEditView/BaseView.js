import React from 'react'


import { DateTime } from 'luxon'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import CachedIcon from '@material-ui/icons/Cached';

export default function BaseView(props) {

    console.log('BaseView props')
    console.log(props)

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
                                {props.clients.map((d, i) => <Chip label={(() => {
                                    return `${d.clientname}(${d.clientphonenumber})`
                                })()} onDelete={e => {
                                    let newClients = [...props.clients]
                                    newClients.splice(i, 1)
                                    console.log(newClients)
                                    props.setClients?.(newClients)

                                }}></Chip>)}
                                <Chip label='add' onClick={e => props.onAddClient?.()} />
                            </Box>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            수업종류
                </TableCell>
                        <TableCell>
                            <span>{activity_type_to_kor[props.data.activity_type]}/{grouping_type_to_kor[props.data.grouping_type]}</span>
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
                <Button variant='outlined' onClick={e => props.onRequestChange?.()}>변경요청</Button>

            </DialogActions>

        </>
    )
}