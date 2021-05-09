import { DialogContent, DialogActions, Button, Table, TableRow, TableCell, TextField, FormControl, FormLabel, Checkbox, FormControlLabel, Radio } from '@material-ui/core'
import React, { useState } from 'react'
import ClientSearchComponent from '../../../components/ClientSearchComponent4'

import client from '../../../apolloclient'

// 회원 변경, 총가격변경, 타입변경

export default function Container(props) {

    console.log('basic edit view container')
    console.log(props)

    const [totalcost, setTotalcost] = useState(props.editData.totalcost)
    const [clientInfo, setClientInfo] = useState({
        id: props.editData.clientid,
        clientname: props.editData.clientname,
        clientphonenumber: props.editData.clientphonenumber
    })

    const [selectedActivityTypes, setSelectedActivityTypes] = useState((() => {
        let s = {}
        props.editData.types.forEach(a => s[a.activity_type] = true)
        return s
    })())
    const [selectedGroupingType, setSelectedGroupingType] = useState(props.editData.types[0].grouping_type)


    return (
        <>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>
                            회원
                        </TableCell>
                        <TableCell>
                            <ClientSearchComponent client={clientInfo} onClientSelected={d => setClientInfo(d)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            총가격
                        </TableCell>
                        <TableCell>
                            <TextField value={totalcost} onChange={e => setTotalcost(e.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            수업타입
                        </TableCell>
                        <TableCell>
                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['PILATES']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.PILATES = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='필라테스'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['GYROTONIC']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.GYROTONIC = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='자이로토닉'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['BALLET']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.BALLET = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='발레'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['GYROKINESIS']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.GYROKINESIS = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='자이로키네시스'
                            />

                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            그룹타입
                        </TableCell>
                        <TableCell>
                            <FormControlLabel control={<Radio value='INDIVIDUAL' checked={selectedGroupingType === 'INDIVIDUAL'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='개별' />
                            <FormControlLabel control={<Radio value='SEMI' checked={selectedGroupingType === 'SEMI'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='세미' />
                            <FormControlLabel control={<Radio value='GROUP' checked={selectedGroupingType === 'GROUP'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='그룹' />
                        </TableCell>
                    </TableRow>
                </Table>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onCancel?.()}>취소</Button>
                <Button>수정</Button>
            </DialogActions>
        </>
    )
}