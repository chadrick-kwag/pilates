import React from 'react'
import { Table, TableCell, TableRow, Button, CircularProgress, DialogActions } from '@material-ui/core'
import { activity_type_to_kor, grouping_type_to_kor } from '../../common/consts'
import PhoneIcon from '@material-ui/icons/Phone';
import ViewTicketTable from './ViewTicketTable'


import numeral from 'numeral'
export default function DetailView(props) {


    return (
        <div className='col-gravity-center'>
            <h2>견습강사플랜 상세</h2>
            <Table>

                <TableRow>
                    <TableCell>견습강사</TableCell>
                    <TableCell><span>{props.data.appInst.name}(<PhoneIcon fontSize='small' />{props.data.appInst.phonenumber})</span></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>수업종류</TableCell>
                    <TableCell>{activity_type_to_kor[props.data.activityType]}/{grouping_type_to_kor[props.data.groupingType]}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>횟수</TableCell>
                    <TableCell>
                        {props.data.tickets === null ? null : <span>{props.data.rounds}회</span>}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>총비용</TableCell>
                    <TableCell>
                        <div className='row-gravity-left children-padding'>
                            <span>{numeral(props.data.totalCost).format('0,0')}원</span>
                            {(() => {
                                if (props.data.totalCost !== null && props.data.tickets !== null) {
                                    const percost = Math.floor(props.data.totalCost / props.data.tickets.length)

                                    return <span>(회당단가 {numeral(percost).format('0,0')}원)</span>
                                }
                            })()}
                        </div>


                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>티켓</TableCell>
                    <TableCell>
                        {props.data.tickets === null ? <CircularProgress /> :
                            props.data.tickets.length === 0 ? <span>no tickets</span> :
                                <ViewTicketTable tickets={props.data.tickets} />}
                    </TableCell>
                </TableRow>
            </Table>

            {/* <div className='row-gravity-center'> */}
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전</Button>
                <Button variant='outlined' onClick={e => props.onEdit?.()}>기본수정</Button>
                <Button variant='outlined' onClick={e => props.onTicketEdit?.()}>티켓수정</Button>
            </DialogActions>
            {/* </div> */}

        </div>
    )
}