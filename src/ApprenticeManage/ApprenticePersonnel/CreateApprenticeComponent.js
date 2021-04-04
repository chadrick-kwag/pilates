
import React, { useState, useEffect } from 'react'
import { Table, Form } from 'react-bootstrap'
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

import { FETCH_APPRENTICE_COURSES } from '../../common/gql_defs'

import client from '../../apolloclient'
import CircularProgress from '@material-ui/core/CircularProgress';

export default function CreateApprenticeComponent(props) {

    const [name, setName] = useState(null)
    const [phonenumber, setPhoneNumber] = useState(null)
    const [gender, setGender] = useState(null)
    const [course, setCourse] = useState(null)
    const [courseList, setCourseList] = useState(null)

    const check_inputs = () => {
        if (name === null || name.trim() === "") {
            return false
        }

        if (phonenumber === null || phonenumber.trim() === "") {
            return false
        }


        return true
    }

    useEffect(() => {
        client.query({
            query: FETCH_APPRENTICE_COURSES,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.fetch_apprentice_courses.success) {
                setCourseList(res.data.fetch_apprentice_courses.courses)
            }
            else {
                alert('fetch courses failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch courses error')
        })
    }, [])

    const submit = () => {
        // check inputs
        if (!check_inputs()) {
            alert('invalid inputs')
            return
        }

    }

    return (
        <div className='col-gravity-center'>
            <h2>견습강사생성</h2>
            <Table>
                <tbody>
                    <tr>
                        <td>
                            이름
                        </td>
                        <td>
                            <Form.Control value={name} onChange={e => setName(e.target.value)}></Form.Control>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            성별
                        </td>
                        <td>
                            <Radio
                                checked={gender === 'male'}
                                onChange={_ => setGender('male')}
                            />남자
                            <Radio
                                checked={gender === 'female'}
                                onChange={_ => setGender('female')}
                            />여자
                        </td>
                    </tr>
                    <tr>
                        <td>연락처</td>
                        <td>
                            <TextField value={phonenumber} onChange={e => setPhoneNumber(e.target.value)} />
                        </td>
                    </tr>
                    <tr>
                        <td>과정</td>
                        <td>
                            <Select value={course} onChange={e => setCourse(e.target.value)}>
                                {courseList === null ? <MenuItem><CircularProgress size={20} /></MenuItem> : courseList.map(d => <MenuItem value={d.name}>{d.name}</MenuItem>)}
                            </Select>
                        </td>
                    </tr>
                </tbody>
            </Table>


            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={_ => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>생성</Button>
            </div>

        </div>
    )
}