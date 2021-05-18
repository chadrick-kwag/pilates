import React, { useState, useEffect } from 'react'
import { Button, Table, TableRow, TableCell, DialogContent, DialogActions, CircularProgress } from '@material-ui/core'
import {Form} from 'react-bootstrap'
import { DateTime } from 'luxon'
import PropTypes from 'prop-types';


const format_dt = (string_time_number) => {

    const dt = DateTime.fromMillis(parseInt(string_time_number)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')

    return dt

}


function ReadOnlyView({ data, onCancel, onEdit, onDelete }) {


    return (
        <>
            <DialogContent>

                <Table>
                    <TableRow>
                        <TableCell>
                            시간
                                </TableCell>
                        <TableCell>
                            <span>{format_dt(data.starttime)} - {format_dt(data.endtime)}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <span>스케쥴명</span>

                        </TableCell>
                        <TableCell>
                            <span>{data.title}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            메모
                                </TableCell>
                        <TableCell>
                            <Form.Control as='textarea' value={data.memo} rows={5} readOnly/>
                        </TableCell>

                    </TableRow>

                </Table>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel?.()}>닫기</Button>
                <Button onClick={() => onEdit?.()}>수정</Button>
                <Button onClick={() => onDelete?.()}>삭제</Button>
            </DialogActions>
        </>
    )


}

ReadOnlyView.propTypes = {
    data: PropTypes.object,
    onCancel: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
}

export default ReadOnlyView;