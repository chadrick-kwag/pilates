import React from 'react'

import { Table, TableCell, TableRow, TableHead, TableBody } from '@material-ui/core'
import { DateTime } from 'luxon'



const conver_time = (t) => {
    if(t===null){
        return t
    }
    return DateTime.fromMillis(parseInt(t)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')
}

export default function ViewTicketTable(props) {


    return (
        <div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            id
                        </TableCell>
                        <TableCell>
                            만료일시
                        </TableCell>
                        <TableCell>
                            소모수업 시작일시
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.tickets.map(d => <TableRow>
                        <TableCell>
                            {d.id}
                        </TableCell>
                        <TableCell>
                            {conver_time(d.expire_time)}
                        </TableCell>
                        <TableCell>
                            {conver_time(d.consumed_time)}
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </div>
    )
}


