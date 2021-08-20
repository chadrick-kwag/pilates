import React, { useState } from 'react'
import { Chip, CircularProgress, Table, TableRow, TableCell, Button, TextField } from '@material-ui/core'
import client from '../apolloclient'
import { useQuery } from '@apollo/client'
import { withRouter } from 'react-router-dom'
import { QUERY_LESSON_DETAIL_WITH_LESSONID } from '../common/gql_defs'
import { DateTime } from 'luxon'
import { activity_type_to_kor_str, grouping_type_to_kor_str } from '../common/consts'

function NormalLessonView({ history, match }) {


    console.log(match)

    const { loading, data: fetchedData, error } = useQuery(QUERY_LESSON_DETAIL_WITH_LESSONID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            lessonid: parseInt(match.params.id)
        },
        onCompleted: d => {
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    if (loading) {
        return <div className='fwh flex flex-row jc ac'>
            <CircularProgress />

        </div>
    }


    if (error || fetchedData?.query_lesson_detail_with_lessonid?.success === false) {
        return <div className='fwh flex flex-row jc ac'>
            <span>에러</span>
        </div>
    }

    const data = fetchedData?.query_lesson_detail_with_lessonid?.detail

    return (
        <div className="fwh flex-col" style={{ maxHeight: '100%' }}>
            <div className='flex flex-row ac jc vmargin-0.5rem' >
                <span>일반수업</span>
            </div>
            <div>
                <Table>
                    <TableRow>
                        <TableCell>강사</TableCell>
                        <TableCell>{data.instructorname}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수업종류</TableCell>
                        <TableCell>{`${activity_type_to_kor_str(data.activity_type)}/${grouping_type_to_kor_str(data.grouping_type)}`}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수업일시</TableCell>
                        <TableCell>{DateTime.fromMillis(parseInt(data.starttime)).setZone('utc+9').toFormat('y-LL-dd HH:mm')} - {DateTime.fromMillis(parseInt(data.endtime)).setZone('utc+9').toFormat('HH:mm')}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>수강 회원</TableCell>
                        <TableCell>
                            {(() => {
                                if (data.client_info_arr.length === 0) {
                                    return '없음'
                                }

                                return data.client_info_arr.map(a => <Chip label={a.clientname} />)
                            })()}
                        </TableCell>
                    </TableRow>
                </Table>
            </div>
            <div className="flex flex-row jc ac gap" style={{ paddingTop: '1rem' }}>
                <Button variant='outlined' onClick={() => history.goBack()}>이전</Button>
                <Button variant='outlined' disabled={(() => {
                    const data = fetchedData?.query_lesson_detail_with_lessonid?.detail

                    // if students exist, then edit is blocked
                    if (data?.client_info_arr?.length > 0) {
                        return true
                    }

                    return false

                })()} onClick={() => history.push(`/lesson/normal/edit/${match.params.id}`)}>수정</Button>
                <Button variant='outlined' onClick={()=>{
                    let ret = confirm('삭제하시겠습니까?')
                    if(ret){
                         
                    }
                }}>삭제</Button>
            </div>

        </div>
    )
}

export default withRouter(NormalLessonView)
