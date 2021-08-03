import React, { useState } from 'react'
import { Button, Table, TableRow, TableCell, FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core'
import { Form } from 'react-bootstrap'
import moment from 'moment'

import { CREATE_CLIENT_GQL } from '../common/gql_defs'
import { withRouter } from 'react-router-dom'
import client from '../apolloclient'
import { useMutation } from '@apollo/client'

import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import koLocale from "date-fns/locale/ko";



function CreateClientPage({ history, onSubmitSuccess, cancelBtnCallback }) {


    const [name, setName] = useState("")
    const [phonenumber, setPhonenumber] = useState("")
    const [email, setEmail] = useState("")
    const [gender, setGender] = useState(null)
    const [job, setJob] = useState("")
    const [address, setAddress] = useState("")
    const [memo, setMemo] = useState("")
    const [birthdate, setBirthdate] = useState(null)


    const [doSubmit, { loading, data, error }] = useMutation(CREATE_CLIENT_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)

            if (d.createclient.success) {
                onSubmitSuccess?.()
            }
            else {
                alert('생성 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('생성 에러')
        }
    })


    const is_submit_disabled = () => {
        if (name.trim() === "" || phonenumber.replace('-', '').trim() === "") {
            return true
        }

        return false
    }


    const request_submit = () => {
        if (is_submit_disabled()) {
            return
        }


        doSubmit({
            variables: {
                phonenumber,
                job,
                name,
                gender,
                birthdate: birthdate !== null ? birthdate.toUTCString() : null,
                email,
                memo
            }
        })
    }

    return <div style={{ width: '100%', height: '100%' }}>

        <Table>
            <TableRow>
                <TableCell>
                    이름
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={name} onChange={e => setName(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    연락처
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={phonenumber} onChange={e => setPhonenumber(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    성별
                </TableCell>
                <TableCell>
                    <RadioGroup value={gender} onChange={e => setGender(e.target.value)}>
                        <FormControlLabel control={<Radio />} label="남" value="MALE" />
                        <FormControlLabel control={<Radio />} label="여" value="FEMALE" />

                    </RadioGroup>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    생일
                </TableCell>
                <TableCell>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>
                        <DateTimePicker
                            emptyLabel="날짜를 선택해주세요"
                            variant="inline"
                            value={birthdate}
                            onChange={e => {
                                setBirthdate(e)
                            }}
                            minutesStep={15}
                            ampm={false}
                        />
                    </MuiPickersUtilsProvider>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    주소
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={address} onChange={e => setAddress(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    이메일
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={email} onChange={e => setEmail(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    직업
                </TableCell>
                <TableCell>
                    <TextField variant='outlined' value={job} onChange={e => setJob(e.target.value)} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    메모
                </TableCell>
                <TableCell>
                    <Form.Control as='textarea' rows='5' value={memo} onChange={e => setMemo(e.target.value)} />
                </TableCell>
            </TableRow>
        </Table>
        <div style={{ width: '100%', padding: '0.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', boxSizing: 'border-box' }}>
            <Button varaint='outlined' onClick={() => cancelBtnCallback?.()}>이전</Button>
            <Button disabled={is_submit_disabled()} varaint='outlined' onClick={() => request_submit()} >생성</Button>

        </div>

    </div>

}

export default withRouter(CreateClientPage)
