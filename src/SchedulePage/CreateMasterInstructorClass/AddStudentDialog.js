import React, { useState } from 'react'

import { Dialog, DialogActions, DialogContent, Button } from '@material-ui/core'


import ApprenticeInstructorSearchComponent from '../../components/ApprenticeInstructorSearchComponent'
import PropTypes from 'prop-types';

function AddStudentDialog({ onStudentSelected, onClose }) {

    const [student, setStudent] = useState(null)
    return (
        <Dialog open={true} onClose={() => onClose?.()}>
            <DialogContent>
                <ApprenticeInstructorSearchComponent onSelect={p => setStudent(p)} />

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose?.()}>취소</Button>
                <Button disabled={student === null} onClick={() => onStudentSelected?.(student)}>추가</Button>
            </DialogActions>

        </Dialog>
    )
}


AddStudentDialog.PropTypes = {
    onStudentSelected: PropTypes.func,
    onClose: PropTypes.func
}

export default AddStudentDialog