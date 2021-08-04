import React from 'react'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { UPDATE_INSTRUCTOR_INFO_GQL, FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID, FETCH_INSTRUCTOR_LEVEL_INFO } from '../common/gql_defs'
import { useQuery } from '@apollo/client'
import { CircularProgress, Table, TableRow, TableCell, Button, Checkbox, FormControlLabel } from '@material-ui/core'
import { DateTime } from 'luxon'



function ViewInfoPage({ match, history, onInfoReceived }) {

    console.log(match)

    const { loading, data, error } = useQuery(FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID, {
        client: client,
        variables: {
            id: parseInt(match.params.id)
        },
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

        }
    })



    return <div style={{ width: '100%', height: '100%' }}>
        {(() => {
            if (loading) {
                return <CircularProgress />
            }
            else {
                if (error || data?.fetch_instructor_with_id?.success === false) {
                    return <span>error</span>
                }
                const info = data.fetch_instructor_with_id.instructor

                return <>
                    <Table>
                        <TableRow>
                            <TableCell>
                                이름
                            </TableCell>
                            <TableCell>
                                {info.name}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                폰번호
                            </TableCell>
                            <TableCell>
                                {info.phonenumber}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                이메일
                            </TableCell>
                            <TableCell>
                                {info.email}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                성별
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    if (info.gender?.toLowerCase() === 'male') {
                                        return '남자'
                                    }
                                    else if (info.gender?.toLowerCase() === 'female') {
                                        return '여자'
                                    }

                                    return '-'
                                })()}

                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                레벨
                            </TableCell>
                            <TableCell>
                                {info.level_string}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                메모
                            </TableCell>
                            <TableCell>
                                {info.memo}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                지도 옵션
                            </TableCell>
                            <TableCell>
                                <FormControlLabel label='지도자과정 수업지도 가능' control={<Checkbox disabled checked={info.allow_teach_apprentice} />} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                주소
                            </TableCell>
                            <TableCell>
                                {info.address}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                생성일시
                            </TableCell>
                            <TableCell>
                                {DateTime.fromMillis(parseInt(info.created)).setZone('utc+9').toFormat('y-LL-dd HH:mm')}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                직업
                            </TableCell>
                            <TableCell>
                                {info.job}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                자격취득일
                            </TableCell>
                            <TableCell>
                                {info.validation_date !== null ? DateTime.fromMillis(parseInt(info.validation_date)).setZone('utc+9').toFormat('y-LL-dd HH:mm') : '-'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                생일
                            </TableCell>
                            <TableCell>
                                {info.birthdate !== null ? DateTime.fromMillis(parseInt(info.birthdate)).setZone('utc+9').toFormat('y-LL-dd HH:mm') : '-'}
                            </TableCell>
                        </TableRow>
                    </Table>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant='outlined' onClick={() => history.push('/instructormanage')}>이전</Button>
                        <Button variant='outlined' onClick={() => {
                            onInfoReceived(info)
                            history.push(`/instructormanage/edit/${match.params.id}`)
                        }}>수정</Button>
                    </div>
                </>


            }
        })()}
    </div>
}

export default withRouter(ViewInfoPage)