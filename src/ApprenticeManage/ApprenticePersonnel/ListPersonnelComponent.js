import React from 'react'
import {Button} from 'react-bootstrap'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';

import client from '../../apolloclient'

export default function ListPersonnelComponent(props){

    return (
        <div>
            <div>
                <Button onClick={e=>props.onCreateApprentice?.()}>견습강사생성</Button>
            </div>
            listpersonnel
        </div>
    )
}