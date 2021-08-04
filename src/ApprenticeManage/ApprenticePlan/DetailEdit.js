import React, { useState } from 'react'
import { Table, TableCell, TableRow, Button, TextField, Select, MenuItem, DialogActions } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'
import client from '../../apolloclient'
import numeral from 'numeral'
import PhoneIcon from '@material-ui/icons/Phone';
import ErrorIcon from '@material-ui/icons/Error';
import { UPDATE_TOTALCOST_OF_PLAN } from '../../common/gql_defs'
import { useMutation } from '@apollo/client'


export default function DetailEdit(props) {



    const [appInst, setAppInst] = useState(props.data.appInst)
    const [totalCost, setTotalCost] = useState(props.data.totalCost)
    const [rounds, setRounds] = useState(props.data.rounds)
    const [created, setCreated] = useState(props.data.created)
    const [activityType, setActivityType] = useState(props.data.activityType)
    const [groupingType, setGroupingType] = useState(props.data.groupingType)
    const [updateTotalcost] = useMutation(UPDATE_TOTALCOST_OF_PLAN, {
        client: client,
        onCompleted: d => {
            console.log(d)
            if (d.update_totalcost_of_plan.success) {
                props.onSuccess?.()
            }
            else {
                alert('total cost update fail')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('total cost update error')
        }
    })

    const submit = () => {

        if (isNaN(parseInt(totalCost))) {
            alert('총비용 값이 올바르지 않습니다')
            return
        }

        if (parseInt(totalCost) < 0) {
            alert('총비용 값이 올바르지 않습니다')
            return
        }

        updateTotalcost({
            variables: {
                id: appInst.id,
                totalcost: parseInt(totalCost)
            },
            fetchPolicy: 'no-cache'
        })

    }


    const show_safe_numeral_number = (a) => {
        console.log(a)

        if (isFinite(a)) {
            return numeral(Math.ceil(a)).format('0,0')
        }

        if (isNaN(a)) {
            return <ErrorIcon fontSize='small' />
        }

        console.log(a)
        return <ErrorIcon fontSize='small' />


    }

    return (
        <div>
            <Table>
                <TableRow>
                    <TableCell>
                        견습강사
                    </TableCell>
                    <TableCell>
                        <span>{appInst.name}(<PhoneIcon fontSize='small' />{appInst.phonenumber})</span>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        액티비티 종류
                    </TableCell>
                    <TableCell>
                        <span>{activity_type_to_kor[activityType]}</span>

                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        그룹 종류
                    </TableCell>
                    <TableCell>
                        <span>{grouping_type_to_kor[groupingType]}</span>

                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        횟수
                    </TableCell>
                    <TableCell>
                        <span>{rounds}회</span>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        총비용
                    </TableCell>
                    <TableCell>
                        <TextField value={totalCost} onChange={e => setTotalCost(e.target.value)} />
                        <span>회당단가:{show_safe_numeral_number(totalCost / rounds)}원</span>
                    </TableCell>
                </TableRow>
            </Table>

            <DialogActions>

                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>수정</Button>
            </DialogActions>

        </div>
    )
}