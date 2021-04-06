import React from 'react'

import { Table, TableCell, TableRow, TableHead, TableBody } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { DateTime } from 'luxon'


const columns = [
    { field: 'id', headerName: 'id', flex: 0.3 },
    { field: 'expire_time', headerName: '만료일시', flex:1 },
    { field: 'consumed_time', headerName: '소모수업 시작일시', flex:1 }
]



export default function TicketEdit(props) {
    console.log('props')
    console.log(props)

    return (
        <div style={{ width: '100%', height: 500 }}>
            <DataGrid rows={props.tickets} columns={columns} />

        </div>
    )

}