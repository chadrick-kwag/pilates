import React, { useState } from 'react'
import { Dialog, DialogContent, CircularProgress, Table, TableRow, TableCell, Chip } from '@material-ui/core'
import { DateTime } from 'luxon'
import { activity_type_to_kor, grouping_type_to_kor, lesson_domain_type_to_kor } from '../src/common/consts'

function DetailDialog({ onClose, schedule_info }) {


    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            <Table>
                <TableRow>
                    <TableCell className='table-keycell'>수업구분</TableCell>
                    <TableCell>{lesson_domain_type_to_kor[schedule_info.lesson_domain]}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className='table-keycell'>강사</TableCell>
                    <TableCell>{schedule_info.instructorname}({schedule_info.instructorphonenumber})</TableCell>
                </TableRow>
                {schedule_info.client_info_arr ? <TableRow>
                    <TableCell className='table-keycell'>회원</TableCell>
                    <TableCell>{schedule_info.client_info_arr.map(a => <Chip label={`${a.clientname}`} />)}</TableCell>
                </TableRow> : null}

                <TableRow>
                    <TableCell className='table-keycell'>수업시간</TableCell>
                    <TableCell>{DateTime.fromMillis(parseInt(schedule_info.starttime)).setZone('utc+9').toFormat('L월 d일 HH:mm')} - {DateTime.fromMillis(parseInt(schedule_info.endtime)).setZone('utc+9').toFormat('HH:mm')}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className='table-keycell'>수업종류</TableCell>
                    <TableCell>{activity_type_to_kor[schedule_info.activity_type]}/{grouping_type_to_kor[schedule_info.grouping_type]}</TableCell>
                </TableRow>
            </Table>
        </DialogContent>


    </Dialog>

}


export default DetailDialog