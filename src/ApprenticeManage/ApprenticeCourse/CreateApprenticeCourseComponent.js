import React, { useState, useEffect } from 'react'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import client from '../../apolloclient'
import {CREATE_APPRENTICE_COURSE} from '../../common/gql_defs'

export default function CreateApprenticeComponent(props) {

    const [name, setName] = useState(null)


    const checkinput = ()=>{
        if(name === null || name.trim() === ""){
            return false
        }

        return true
    }

    const submit = ()=>{
        // check input

        if(!checkinput()){
            alert('invalid input')
            return
        }


        client.query({
            query: CREATE_APPRENTICE_COURSE,
            variables: {
                name: name
            },
            fetchPolicy: 'no-cache'
    
        }).then(res=>{
            if(res.data.create_apprentice_course.success){
                props.onSuccess?.()
            }
            else{
                alert('create failed')
            }
        }).catch(e=>{
            console.log(JSON.stringify(e))
            alert('create error')
        })


    }

    return (
        <div>
            <h2>과정 생성</h2>
            <Table>
                <TableBody>
                    <TableRow>

                        <TableCell>
                            과정명
                    </TableCell>
                        <TableCell>
                            <TextField variant='outlined' value={name} onChange={e => setName(e.target.value)} />
                        </TableCell>
                    </TableRow>



                </TableBody>


            </Table>

            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={_=>props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e=>submit()}>생성</Button>
            </div>
        </div>
    )
}