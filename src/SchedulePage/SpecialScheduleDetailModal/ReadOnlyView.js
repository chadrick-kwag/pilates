import React, { useState, useEffect } from 'react'
import { Button, Table, TableRow, TableCell, DialogContent, DialogActions, CircularProgress } from '@material-ui/core'

import client from '../../apolloclient'
import {DateTime} from 'luxon'

import { FETCH_SPECIAL_SCHEDULE_BY_ID } from '../../common/gql_defs'


const format_dt = (string_time_number)=>{

    const dt = DateTime.fromMillis(parseInt(string_time_number)).setZone('UTC+9').toFormat('y-LL-dd HH:mm')

    return dt

}


export default function ReadOnlyView(props) {

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetch_data = () => {

        setLoading(true)

        const _var = {
            id: props.id
        }

        client.query({
            query: FETCH_SPECIAL_SCHEDULE_BY_ID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_special_schedule_by_id.success) {
                setData(res.data.fetch_special_schedule_by_id.schedule)
            }
            else {
                alert(`스케쥴 가져오기 실패 (${res.data.fetch_special_schedule_by_id.msg})`)
            }

            setLoading(false)

        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('스케쥴 가져오기 에러')
            setLoading(false)
        })
    }


    useEffect(() => {
        fetch_data()
    }, [])


    if (loading) {
        return (
            <>
                <CircularProgress />
            </>
        )
    }
    else {

        if (data === null) {
            return (
                <>
                    <span>error</span>
                </>
            )
        }
        else {
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
                                    <span>{data.memo}</span>
                                </TableCell>

                            </TableRow>

                        </Table>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => props.onCancel?.()}>닫기</Button>
                        <Button onClick={() => props.onEdit?.()}>수정</Button>
                    </DialogActions>
                </>
            )
        }

    }

}