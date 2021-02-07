import React from 'react'
import { Spinner, Table, Button } from 'react-bootstrap'

import {get_null_safe_date_format} from '../common/date_fns'


function TicketList(props) {

    console.log('inside ticketlist')

    console.log(props)

    if (props.tickets === null || props.tickets === undefined) {
        return <div><Spinner></Spinner></div>
    }
    else if (props.tickets.length == 0) {
        return <div>no tickets</div>
    }
    else {
        // there are tickets.

        let total_tickets = props.tickets.length
        let consumed_count = 0

        props.tickets.forEach(a => {
            if (a.consumed_date !== null) {
                consumed_count += 1
            }
        })

        return <div>
            <div>
                <span>전체횟수: {total_tickets} / 소모횟수: {consumed_count} / 잔여횟수: {total_tickets - consumed_count}</span>
            </div>

            <Table >

                <thead>
                    <th>#</th>
                    <th>expire time</th>
                    <th>created</th>
                    <th>consumed by</th>
                    <th>destroyed</th>
                </thead>
                <tbody>
                    {props.tickets.map((d, index) => {
                        let tr_classname = ""
                        let expire_date = new Date(parseInt(d.expire_time))
                        if (expire_date < new Date()) {
                            tr_classname = "table-row-expired"
                        }
                        return <tr className={tr_classname}>
                            <td>{index + 1}</td>
                            <td>{get_null_safe_date_format(d.expire_time, '-')}</td>
                            <td>{get_null_safe_date_format(d.created_date, '-')}</td>
                            <td>{get_null_safe_date_format(d.consumed_date, '-')}</td>
                            <td>{get_null_safe_date_format(d.destroyed_date, '-')}</td>
                        </tr>
                    })}
                </tbody>

            </Table></div>
    }


}


export default TicketList