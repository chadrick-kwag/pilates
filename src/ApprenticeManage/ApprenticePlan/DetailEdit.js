import React, { useState } from 'react'
import { Table, TableCell, TableRow, Button, TextField, Select, MenuItem } from '@material-ui/core'

import client from '../../apolloclient'
import numeral from 'numeral'



export default function DetailEdit(props) {



    const [appInst, setAppInst] = useState(props.data.appInst)
    const [totalCost, setTotalCost] = useState(props.data.totalCost)
    const [rounds, setRounds] = useState(props.data.rounds)
    const [created, setCreated] = useState(props.data.created)
    const [activityType, setActivityType] = useState(props.data.activityType)
    const [groupingType, setGroupingType] = useState(props.data.groupingType)


    const submit = () => {
        // check input

        alert('test submit')

    }

    return (
        <div>
            <Table>
                <TableRow>
                    <TableCell>
                        견습강사
                    </TableCell>
                    <TableCell>
                        blah
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        액티비티 종류
                    </TableCell>
                    <TableCell>
                        <Select value={activityType} onChange={e => setActivityType(e.target.value)}>
                            <MenuItem value='PILATES'>필라테스</MenuItem>
                            <MenuItem value='GYROTONIC'>자이로토닉</MenuItem>
                        </Select>

                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        그룹 종류
                    </TableCell>
                    <TableCell>
                        <Select value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                            <MenuItem value='INDIVIDUAL'>개별</MenuItem>
                            <MenuItem value='SEMI'>세미</MenuItem>
                            <MenuItem value='GROUP'>그룹</MenuItem>
                        </Select>

                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        횟수
                    </TableCell>
                    <TableCell>
                        <TextField value={rounds} onChange={e => setRounds(e.target.value)} />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        총비용
                    </TableCell>
                    <TableCell>
                        <TextField value={totalCost} onChange={e => setTotalCost(e.target.value)} />
                        <span>회당단가:{numeral(Math.ceil(totalCost / rounds)).format('0,0')}원</span>
                    </TableCell>
                </TableRow>
            </Table>

            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>수정</Button>
            </div>
        </div>
    )
}