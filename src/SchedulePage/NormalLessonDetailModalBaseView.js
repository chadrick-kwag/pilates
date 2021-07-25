import React, { useState, createRef } from 'react'

import { Button, Menu, MenuItem, Table, TableRow, TableCell, Chip, Dialog, DialogActions, DialogContent } from '@material-ui/core'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { DateTime } from 'luxon'

import client from '../apolloclient'
import { DELETE_LESSON_WITH_REQUEST_TYPE_GQL } from '../common/gql_defs'

export default function NormalLessonDetailModalBaseView(props) {

    console.log(props)

    const [showCancelMenu, setShowCancelMenu] = useState(false)
    const [cancelBtnRef, setCancelBtnRef] = useState(null)


    const delete_lesson_with_request_type = (request_type, ignore_warning = false) => {


        // if lesson is individual grouping type, then use CANCEL_INDIVIDUAL_LESSON

        console.log(props.view_selected_lesson)


        // for non individual types

        const _var = {
            lessonid: props.data.indomain_id,
            ignore_warning: ignore_warning,
            request_type: request_type
        }

        console.log(_var)


        client.mutate({
            mutation: DELETE_LESSON_WITH_REQUEST_TYPE_GQL,
            variables: _var
        }).then(d => {
            console.log(d)

            if (d.data.delete_lesson_with_request_type.penalty_warning === true) {

                let ret = confirm(d.data.delete_lesson_with_request_type.msg)

                if (ret) {
                    this.delete_lesson_with_request_type(request_type, true)
                }

                // if do not proceed
                return
            }

            if (d.data.delete_lesson_with_request_type.success) {

                props.onCloseAndRefresh?.()
            }
            else {
                alert('failed to delete lesson.' + d.data.delete_lesson_with_request_type.msg)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log('error deleting lesson')
            alert('failed to delete lesson')
        })

    }

    let client_arr = props.data.client_info_arr.map(d => {
        return {
            clientid: d.clientid,
            clientname: d.clientname,
            clientphonenumber: d.clientphonenumber

        }
    })

    let unique_client_arr = []
    client_arr.forEach(d => {
        let _cid = d.clientid
        let included = false
        for (let i = 0; i < unique_client_arr.length; i++) {
            if (unique_client_arr[i].clientid == _cid) {
                included = true;
                break
            }
        }

        if (!included) {
            unique_client_arr.push(d)
        }
    })

    console.log('unique_client_arr')
    console.log(unique_client_arr)

    return (
        <>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>강사</TableCell>
                        <TableCell>
                            <Chip label={`${props.data.instructorname}(${props.data.instructorphonenumber})`} />
                        </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell>회원</TableCell>
                        <TableCell>

                            {unique_client_arr?.map(d => <Chip label={<div>{d.clientname}({d.clientphonenumber})</div>} />)}



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

                <Button variant='outlined' onClick={e => props.onEdit?.()}>수업변경</Button>
                <Button variant='outlined' onClick={e => {
                    setCancelBtnRef(e.currentTarget)
                    setShowCancelMenu(true)
                }}>수업취소</Button>
                <Menu anchorEl={cancelBtnRef} open={showCancelMenu} onClose={() => setShowCancelMenu(false)}>
                    <MenuItem onClick={() => delete_lesson_with_request_type('admin_req')}>관리자권한</MenuItem>
                    <MenuItem onClick={() => delete_lesson_with_request_type('instructor_req')}>강사요청</MenuItem>
                </Menu>
                <Button variant='outlined' color='secondary' onClick={e => props.onClose?.()}>닫기</Button>

            </DialogActions>
        </>
    )
}