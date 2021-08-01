import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Table, TableRow, TableCell, Button, TextField, Radio, FormControlLabel, RadioGroup, TextareaAutosize, CircularProgress, Select, MenuItem } from '@material-ui/core'
import { DateTime } from 'luxon'
import { DatePicker } from '@material-ui/pickers'
import client from '../apolloclient'
import { UPDATE_INSTRUCTOR_INFO_GQL, FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID, FETCH_INSTRUCTOR_LEVEL_INFO } from '../common/gql_defs'
import { useQuery, useMutation } from '@apollo/client'


const set_obj_value = (obj, key, value) => {
    obj[key] = value
    return obj
}

function EditInfoPage({ match, history, initInfo }) {

    console.log('initInfo')
    console.log(initInfo)


    const { loading, data: level_data, error } = useQuery(FETCH_INSTRUCTOR_LEVEL_INFO, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
        }
    })


    const [updateInfo, { loading: _loading, data: updateInfoData, error2 }] = useMutation(UPDATE_INSTRUCTOR_INFO_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

            if (!d.update_instructor.success) {
                alert('업데이트 실패')
            }
            else {
                history.goBack()
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('업데이트 에러')
        }
    })

    const [info, setInfo] = useState({
        ...initInfo,
        birthdate: initInfo.birthdate ? parseInt(initInfo.birthdate) : null,
        validation_date: initInfo.validation_date ? parseInt(initInfo.validation_date) : null
    })

    console.log('info')
    console.log(info)


    if (info === null) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span>데이터가 없습니다</span>

        </div>
    }
    return <div style={{ width: '100%', height: '100%' }}>


        <Table>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    이름
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={info.name} onChange={a => setInfo(set_obj_value({ ...info }, 'name', a.target.value))} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    폰번호
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={info.phonenumber} onChange={a => setInfo(set_obj_value({ ...info }, 'phonenumber', a.target.value))} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    이메일
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={info.email} onChange={a => setInfo(set_obj_value({ ...info }, 'email', a.target.value))} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    성별
                </TableCell>
                <TableCell>
                    <RadioGroup value={info.gender} onChange={a => setInfo(set_obj_value({ ...info }, 'gender', a.target.value))}>
                        <FormControlLabel value='FEMALE' control={<Radio />} label='여자' />
                        <FormControlLabel value='MALE' control={<Radio />} label='남자' />
                        <FormControlLabel value='' control={<Radio />} label='없음' />
                    </RadioGroup>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    레벨
                </TableCell>
                <TableCell>
                    {(() => {
                        if (loading) {
                            return <CircularProgress />
                        }
                        else {
                            if (error || level_data?.fetch_instructor_level_info?.success === false) {
                                return <span>조회 에러</span>
                            }

                            return <Select value={info.level}>
                                <MenuItem value={null}>없음</MenuItem>
                                {level_data?.fetch_instructor_level_info?.info_list?.map(a => <MenuItem value={a.rank}
                                    onClick={() => {
                                        setInfo(set_obj_value({ ...info }, 'level', a.rank))
                                    }
                                    }>
                                    {a.level_string}
                                </MenuItem>)}
                            </Select>
                        }
                    })()}

                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    메모
                </TableCell>
                <TableCell>
                    <TextareaAutosize style={{ width: '100%' }} rows={3} value={info.memo} onChange={a => setInfo(set_obj_value({ ...info }, 'memo', a.target.value))} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    주소
                </TableCell>
                <TableCell>
                    <TextField style={{ width: '100%' }} variant='outlined' value={info.address} onChange={a => setInfo(set_obj_value({ ...info }, 'address', a.target.value))} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    직업
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={info.job} onChange={a => setInfo(set_obj_value({ ...info }, 'job', a.target.value))} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    자격취득일
                </TableCell>
                <TableCell>

                    <DatePicker
                        variant="inline"
                        autoOk={true}
                        invalidLabel="날짜 선택"
                        emptyLabel="날짜 선택"
                        inputVariant="outlined"
                        value={info.validation_date ? DateTime.fromMillis(info.validation_date).setZone('utc+9') : null}
                        onChange={e => {
                            setInfo(set_obj_value({ ...info }, 'validation_date', e.getTime()))
                        }}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ maxWidth: 'min-content' }}>
                    생일
                </TableCell>
                <TableCell>
                    <DatePicker
                        variant="inline"
                        autoOk={true}
                        invalidLabel="날짜 선택"
                        emptyLabel="날짜 선택"
                        inputVariant="outlined"
                        value={info.birthdate ? DateTime.fromMillis(info.birthdate).setZone('utc+9') : null}
                        onChange={e => {
                            setInfo(set_obj_value({ ...info }, 'birthdate', e.getTime()))
                        }}
                    />
                </TableCell>
            </TableRow>
        </Table>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
            <Button variant='outlined' onClick={() => {

                let b = null
                if (info.birthdate) {
                    let a = new Date()
                    a.setTime(info.birthdate)
                    b = a.toUTCString()
                }

                let v = null
                if (info.validation_date) {
                    let d = new Date()
                    d.setTime(info.validation_date)
                    v = d.toUTCString()
                }

                const _var = {
                    ...info,
                    birthdate: b,
                    validation_date: v,
                    gender: info.gender === "" ? null : info.gender
                }

                updateInfo({
                    variables: _var
                })
            }}>{_loading ? <CircularProgress /> : '완료'}</Button>

        </div>
    </div>
}


export default withRouter(EditInfoPage)