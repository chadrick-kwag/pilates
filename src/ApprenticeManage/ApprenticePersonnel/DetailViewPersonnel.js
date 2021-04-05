import React from 'react'

import { Table, TableCell, TableRow, Button } from '@material-ui/core'

export default function DetailViewPersonnel(props) {



    const gender_to_kortext = (g) => {
        if (g === 'MALE') {
            return '남자'
        }
        else if (g === 'FEMALE') {
            return '여자'
        }
        else {
            return g
        }
    }


    return (
        <>
            <Table>
                <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell><span>{props.name}</span></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>연락처</TableCell>
                    <TableCell>{props.phonenumber}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>성별</TableCell>
                    <TableCell>{gender_to_kortext(props.gender)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>과정명</TableCell>
                    <TableCell>{props.courseName}</TableCell>
                </TableRow>
            </Table>

            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>이전</Button>
                <Button variant='outlined' onClick={e => props.onEdit?.()}>수정</Button>
            </div>
        </>
    )
}