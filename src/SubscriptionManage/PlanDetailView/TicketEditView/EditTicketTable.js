import React, { useState, useEffect } from 'react'

import { Table, TableRow, TableCell, Checkbox } from '@material-ui/core'
import { DateTime } from 'luxon'




export default function EditTicketTable(props) {

    const [tickets, setTickets] = useState(props.tickets)
    const [selectlist, setSelectList] = useState((new Array(props.tickets.length)).fill(false))
    const [selectAllowedList, setSelectAllowedList] = useState((() => {
        let out = new Array(props.tickets.length).fill(true)
        return out
    })())

    useEffect(() => {

        let selected_ticket_id_arr = []
        for (let i = 0; i < selectlist.length; i++) {
            if (selectlist[i]) {
                selected_ticket_id_arr.push(tickets[i].id)
            }
        }
        props.onSelectChanged?.(selected_ticket_id_arr)
    }, [selectlist])


    const get_root_checkbox_checked = () => {
        let no_checked = true
        let all_checked = true

        for (let i = 0; i < selectlist.length; i++) {

            if (selectlist[i]) {
                no_checked = false
            }

            if (!selectlist[i]) {
                all_checked = false
            }
        }

        if (no_checked) {
            return 'uncheck'
        }
        else if (all_checked) {
            return 'check'
        }
        else {
            return 'part'
        }
    }


    return (
        <Table>
            <TableRow>
                <TableCell>
                    <Checkbox indeterminate={get_root_checkbox_checked() === 'part'} checked={get_root_checkbox_checked() === 'check'} onChange={e => {
                        if (e.target.checked === true) {
                            let newarr = new Array(selectlist.length)
                            newarr.fill(true)

                            setSelectList(newarr)
                        }
                        else if (e.target.checked === false) {
                            let newarr = new Array(selectlist.length)
                            newarr.fill(false)

                            setSelectList(newarr)
                        }
                    }} />
                </TableCell>
                <TableCell>
                    <span>티켓id</span>
                </TableCell>
                <TableCell>
                    만료일시
                </TableCell>
                <TableCell>
                    소모된 수업시작일시
                </TableCell>
                <TableCell>
                    생성일시
                </TableCell>
                <TableCell>
                    양도된 일시
                </TableCell>
            </TableRow>
            {tickets.map((d, i) => <TableRow>
                <TableCell>
                    <Checkbox disabled={!selectAllowedList[i]} checked={selectlist[i]} onChange={e => {
                        console.log(e)
                        console.log(i)
                        let newarr = [...selectlist]
                        newarr[i] = !newarr[i]
                        setSelectList(newarr)

                    }} />
                </TableCell>
                <TableCell>
                    <span>{d.id}</span>
                </TableCell>
                <TableCell>
                    <span>{DateTime.fromMillis(parseInt(d.expire_time)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</span>
                </TableCell>
                <TableCell>
                    <span>{d.consumed_date === null ? '-' : DateTime.fromMillis(parseInt(d.consumed_date)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</span>
                </TableCell>
                <TableCell>
                    <span>{DateTime.fromMillis(parseInt(d.created_date)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</span>
                </TableCell>
                <TableCell>
                    <span>{d.destroyed_date === null ? '-' : DateTime.fromMillis(parseInt(d.destroyed_date)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')}</span>
                </TableCell>
            </TableRow>)}
        </Table>
    )
}