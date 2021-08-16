import React, { useState } from 'react'
import { Button, Menu, MenuItem, Table, TableRow, TableCell, Dialog, Chip, DialogActions, DialogContent, Select, Box } from '@material-ui/core'

import InstructorSearchComponent3 from '../../../components/InstructorSearchComponent3'

export default function ChangeInstructorView(props) {

    const [selectedInstructor, setSelectedInstructor] = useState(null)



    return (
        <>
            <DialogContent>
                <InstructorSearchComponent3 instructorSelectedCallback={d => {
                    console.log(d)
                    setSelectedInstructor(d)
                }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={e => props.onCancel?.()}>이전으로</Button>
                <Button disabled={selectedInstructor === null} onClick={e => {
                    props.onDone?.(selectedInstructor)
                }}>완료</Button>
            </DialogActions>
        </>
    )
}