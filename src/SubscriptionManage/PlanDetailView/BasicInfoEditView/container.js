import { DialogContent, DialogActions, Button, Table, TableRow, TableCell, TextField, Chip, FormControl, FormLabel, Checkbox, FormControlLabel, Radio } from '@material-ui/core'
import React, { useState } from 'react'
import ClientSearchComponent from '../../../components/ClientSearchComponent4'

import client from '../../../apolloclient'
import { UPDATE_NORMAL_PLAN_BASICINFO } from '../../../common/gql_defs'

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


    const submit_pass_check = () => {
        if (selectedGroupingType === null || selectedGroupingType === undefined) {
            return false
        }

        let check = false
        for (const a in selectedActivityTypes) {
            if (selectedActivityTypes[a]) {
                check = true
                break
            }
        }

        if (!check) {
            return false
        }

        if (totalcost === null) {
            return false
        }

        const _t = parseInt(totalcost)

        if (_t < 0 || _t === null) {
            return false
        }

        return true
    }

    const request_update = () => {



        // build types
        const type_arr = []

        for (const a in selectedActivityTypes) {
            if (selectedActivityTypes[a] === true) {
                type_arr.push({
                    activity_type: a,
                    grouping_type: selectedGroupingType
                })
            }
        }

        const _var = {
            planid: props.planid,
            totalcost: parseInt(totalcost),
            types: type_arr,
            clientid: clientInfo.id

        }

        console.log('_var')
        console.log(_var)

        client.mutate({
            mutation: UPDATE_NORMAL_PLAN_BASICINFO,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.update_normal_plan_basicinfo.success) {
                props.onEditSuccess?.()
            }
            else {
                alert(`update failed. msg: ${res.data.update_normal_plan_basicinfo.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))

            alert(`update error`)

        })
    }


    return (
        <>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>
                            회원
                        </TableCell>
                        <TableCell>
                            <Chip label={`${clientInfo.clientname}(${clientInfo.clientphonenumber})`} />
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
                <Button disabled={!submit_pass_check()} onClick={() => request_update()}>수정</Button>
            </DialogActions>
        </>
    )
}