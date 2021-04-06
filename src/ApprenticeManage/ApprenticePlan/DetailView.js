import React from 'react'
import { Table, TableCell, TableRow, Button } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'
import PhoneIcon from '@material-ui/icons/Phone';

import numeral from 'numeral'
export default function DetailView(props) {


    return (
        <div className='col-gravity-center'>
            <h2>견습강사플랜 상세</h2>
            <Table>

                <TableRow>
                    <TableCell>견습강사</TableCell>
                    <TableCell><span>{props.data.appInst.name}(<PhoneIcon fontSize='small'/>{props.data.appInst.phonenumber})</span></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>수업종류</TableCell>
                    <TableCell>{activity_type_to_kor[props.data.activityType]}/{grouping_type_to_kor[props.data.groupingType]}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>횟수</TableCell>
                    <TableCell>{props.data.rounds}회</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>총비용</TableCell>
                    <TableCell>{numeral(props.data.totalCost).format('0,0')}회</TableCell>
                </TableRow>
            </Table>

            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전</Button>
                <Button variant='outlined' onClick={e => props.onEdit?.()}>수정</Button>
            </div>

        </div>
    )
}