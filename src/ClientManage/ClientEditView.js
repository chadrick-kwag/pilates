import React, { useState, useEffect } from 'react'
import { FormControlLabel, RadioGroup, TextField, Radio, Chip, Table, TableRow, TableCell, Button, CircularProgress } from '@material-ui/core'
import { Form } from 'react-bootstrap'
import client from '../apolloclient'
import { useQuery, useMutation } from '@apollo/client'

import { withRouter } from 'react-router-dom'
import { QUERY_CLIENTINFO_BY_CLIENTID, UPDATE_CLIENT_INFO_GQL } from '../common/gql_defs'

import { DateTime } from 'luxon'

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

function ClientEditView({ history, match }) {

    const clientid = parseInt(match.params.id)

    const [name, setName] = useState(null)
    const [phonenumber, setphonenumber] = useState();
    const [memo, setmemo] = useState();
    const [gender, setgender] = useState();
    const [address, setaddress] = useState();
    const [job, setjob] = useState();
    const [birthdate, setbirthdate] = useState();
    const [email, setemail] = useState();


    const { loading, data, error } = useQuery(QUERY_CLIENTINFO_BY_CLIENTID, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            clientid
        },
        onCompleted: d => {
            console.log(d)

            const a = d?.query_clientinfo_by_clientid?.client

            let _bd
            if (a.birthdate === null || a.birthdate === undefined) {
                _bd = null
            }
            else {
                _bd = new Date(parseInt(a.birthdate))
            }

            setName(a.name)
            setphonenumber(a.phonenumber)
            setmemo(a.memo)
            setgender(a.gender)
            setaddress(a.address)
            setjob(a.job)
            setbirthdate(_bd)
            setemail(a.email)

        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('조회 에러')
        }
    })



    const [updateInfo, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_CLIENT_INFO_GQL, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.update_client?.success) {
                history.goBack()
            }

        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })

    const is_submit_disabled = () => {

        if (name === null || name === undefined) return true

        if (phonenumber === null || phonenumber === undefined) return true

        if (name.trim() === "") return true

        if (phonenumber.trim() === "") return true


        return false
    }

    if (loading) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />

        </div>
    }

    if (error || data?.query_clientinfo_by_clientid?.success === false) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span>에러</span>

        </div>
    }



    return <div style={{ width: '100%', height: '100%' }}>

        <Table>
            <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>
                    <TextField value={name} onChange={e => setName(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>연락처</TableCell>
                <TableCell>
                    <TextField value={phonenumber} onChange={e => setphonenumber(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>성별</TableCell>
                <TableCell>
                    <RadioGroup value={gender ?? ""} onChange={e => setgender(e.target.value)}>
                        <FormControlLabel value="MALE" label="남성" control={<Radio />} />
                        <FormControlLabel value="FEMALE" label="여성" control={<Radio />} />
                        <FormControlLabel value="" label="없음" control={<Radio />} />
                    </RadioGroup>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>생년월일</TableCell>
                <TableCell>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                        <DatePicker
                            autoOk
                            value={birthdate}
                            onChange={e => setbirthdate(e)}

                        />
                    </MuiPickersUtilsProvider>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>주소</TableCell>
                <TableCell>
                    <TextField value={address} onChange={e => setaddress(e.target.value)} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>이메일</TableCell>
                <TableCell>
                    <TextField value={email} onChange={e => setemail(e.target.value)} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>직업</TableCell>
                <TableCell>
                    <TextField value={job} onChange={e => setjob(e.target.value)} />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell>메모</TableCell>
                <TableCell>
                    <Form.Control as='textarea' value={memo} onChange={e => setmemo(e.target.value)}></Form.Control>
                </TableCell>
            </TableRow>
        </Table>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
            <Button variant='outlined' disabled={is_submit_disabled()} onClick={() => {
                updateInfo({
                    variables: {
                        id: clientid,
                        name: name.trim(),
                        phonenumber: phonenumber.trim(),
                        email,
                        job,
                        gender: gender === "" ? null : gender,
                        memo,
                        address,
                        birthdate: birthdate !== null ? birthdate.toUTCString() : birthdate
                    }
                })
            }}>완료</Button>

        </div>

    </div>
}


export default withRouter(ClientEditView)