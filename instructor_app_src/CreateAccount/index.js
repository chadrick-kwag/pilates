import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Table, TableRow, TableCell, TextField, Button } from '@material-ui/core'
import client from '../apolloclient'


function CreateAccount({ history }) {


    const [name, setname] = useState("");
    const [phonenumber, setphonenumber] = useState("");
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [repassword, setrepassword] = useState("");


    const submit_disable_handler = () => {
        if (name === "" || phonenumber === "" || username === "" || password === "" || repassword === "") return true

        if (password !== repassword) return true

        return false
    }

    return (
        <div className='fwh flex flex-col ac jc'>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>계정 생성</span>
            <div>

                <Table>
                    <TableRow>
                        <TableCell>성명</TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={name} onChange={e => setname(e.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>연락처</TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={phonenumber} onChange={e => setphonenumber(e.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            계정ID
                        </TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={username} onChange={e => setusername(e.target.value)} />
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell>비밀번호</TableCell>
                        <TableCell>

                            <TextField variant='outlined' value={password} type='password' onChange={e => setpassword(e.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            비밀번호 재입력
                        </TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={repassword} type='password' onChange={e => setrepassword(e.target.value)} />
                        </TableCell>
                    </TableRow>
                </Table>
            </div>


            <div className='flex flex-row ac jc gap vmargin-0.5rem'>
                <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
                <Button variant='outlined' disabled={submit_disable_handler()} >생성</Button>


            </div>

        </div>
    )
}

export default withRouter(CreateAccount)
