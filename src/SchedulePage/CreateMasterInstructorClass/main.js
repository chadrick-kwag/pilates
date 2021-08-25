import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Table, TableRow, TableCell, Button, Select, MenuItem, Chip } from '@material-ui/core'
import client from '../../apolloclient'
import { useMutation } from '@apollo/client'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";
import { DateTime } from 'luxon'
import AddStudentDialog from './AddStudentDialog'

import MasterInstructorSearchComponent from '../../components/MasterInstructorSearchComponent'
import GenericTicketChip from '../../components/GenericTicketChip'

function MainPage({ history }) {


    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)

    const [instructor, setInstructor] = useState(null)
    const [studentInfoArr, setStudentInfoArr] = useState([])
    const [startTime, setStartTime] = useState(DateTime.now().setZone('utc+9'))
    const [durationHours, setDurationHours] = useState(null)

    const [addStudentDialog, setAddStudentDialog] = useState(null)

    const durationOptions = [1, 2, 3, 4, 5, 6]


    return <div style={{ width: '100%', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <span style={{ fontSize: '2rem', paddingLeft: '0.5rem' }}>지도자과정 수업 생성</span>
        </div>

        <Table>
            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    액티비티
                </TableCell>
                <TableCell>
                    <Select value={activityType} onChange={e => setActivityType(e.target.value)} >
                        <MenuItem value={'PILATES'}>필라테스</MenuItem>
                        <MenuItem value={'GYROTONIC'}>자이로토닉</MenuItem>
                        <MenuItem value={'BALLET'}>발레</MenuItem>
                        <MenuItem value={'GYROKINESIS'}>자이로키네시스</MenuItem>
                    </Select>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    그룹
                </TableCell>
                <TableCell>
                    <Select value={groupingType} onChange={e => setGroupingType(e.target.value)} >
                        <MenuItem value={'INDIVIDUAL'}>개별</MenuItem>
                        <MenuItem value={'SEMI'}>세미</MenuItem>
                        <MenuItem value={'GROUP'}>그룹</MenuItem>
                    </Select>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    수업 강사
                </TableCell>
                <TableCell>
                    <MasterInstructorSearchComponent onInstructorSelected={a => setInstructor(a)} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    수강생
                </TableCell>
                <TableCell>
                    {(() => {
                        const output = []

                        let limitcount = null
                        if (groupingType === 'INDIVIDUAL') {
                            limitcount = 1
                        }
                        else if (groupingType === 'SEMI') {
                            limitcount = 2
                        }
                        else if (groupingType === 'GROUP') {
                            limitcount = 20
                        }
                        else {
                            return
                        }


                        studentInfoArr.forEach(a => {
                            output.push(<GenericTicketChip slotTotal={durationHours} name={a.student.name} phonenumber={a.student.phonenumber} tickets={a.tickets} />)
                        })


                        if (output.length < limitcount) {
                            output.push(<Chip onClick={() => setAddStudentDialog(<AddStudentDialog onStudentSelected={s => {
                                setStudentInfoArr([...studentInfoArr].concat({
                                    student: s,
                                    tickets: []
                                }))
                                setAddStudentDialog(null)
                            }} onClose={() => setAddStudentDialog(null)} />)} label='추가' />)
                        }


                        return output
                    })()}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ wordBreak: 'keep-all' }}>
                    수업시간 선택
                </TableCell>
                <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ wordBreak: 'keep-all', marginRight: '0.5rem' }}>시작시간</span>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                            <DateTimePicker
                                variant="outlined"
                                value={startTime}
                                onChange={e => {
                                    setStartTime(e)
                                }}
                                minutesStep={15}
                                ampm={false}
                            />
                        </MuiPickersUtilsProvider>
                        <span style={{ wordBreak: 'keep-all', marginRight: '0.5rem', marginLeft: '0.5rem' }}>길이시간</span>
                        <Select value={durationHours} onChange={e => setDurationHours(e.target.value)}>
                            {durationOptions.map(a => <MenuItem value={a}>{a}</MenuItem>)}
                        </Select>

                    </div>

                </TableCell>
            </TableRow>

        </Table>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '1rem' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
            <Button variant='outlined'>생성</Button>
        </div>

        {addStudentDialog}

    </div>
}


export default withRouter(MainPage)