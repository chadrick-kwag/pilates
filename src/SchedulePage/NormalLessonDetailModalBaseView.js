import React from 'react'

import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, DialogActions, DialogContent } from '@material-ui/core'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { DateTime } from 'luxon'

export default function NormalLessonDetailModalBaseView(props) {
    return (
        <>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>강사</TableCell>
                        <TableCell>{props.data.instructorname}({props.data.instructorphonenumber})</TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell>회원</TableCell>
                        <TableCell>
                            <div style={{ display: 'flex', flexDirection: 'row' }} className='children-padding'>
                                {props.data.client_info_arr?.map(d => <span>{d.clientname}({d.clientphonenumber})</span>)}
                            </div>


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
                            <span>{DateTime.fromMillis(parseInt(props.data.starttime)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')} ~ {DateTime.fromMillis(parseInt(props.data.endtime)).setZone('UTC+9').toFormat('HH:mm')}</span>
                        </TableCell>
                    </TableRow>

                </Table>

            </DialogContent>
            <DialogActions>

                <Button variant='outlined' onClick={e=>props.onEdit?.()}>수업변경</Button>
                <Button variant='outlined' onClick={e=>props.onLessonCancel?.()}>수업취소</Button>
                <Button variant='outlined' color='secondary' onClick={e => props.onClose?.()}>닫기</Button>

            </DialogActions>
        </>
    )
}