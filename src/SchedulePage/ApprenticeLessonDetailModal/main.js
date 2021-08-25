import React, { useState } from 'react'
import { DateTime } from 'luxon'

import { Dialog, DialogTitle, DialogActions, DialogContent, Button, Table, TableRow, TableCell } from '@material-ui/core'
// import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
// import koLocale from "date-fns/locale/ko";

// import DateFnsUtils from "@date-io/date-fns";

// import client from '../apolloclient'
// import { CHANGE_APPRENTICE_LESSON_STARTTIME, CANCEL_APPRENTICE_LESSON } from '../common/gql_defs'

// import { grouping_type_to_kor, activity_type_to_kor } from '../common/consts'
import PT from 'prop-types'

import BaseView from './baseview'
import EditView from './editview'

function ApprenticeLessonDetailModal({ lessonid, onCancel, onCloseAndRefresh }) {


    const [viewMode, setViewMode] = useState('base')


    return <Dialog open={true} onClose={onCancel}>

        {(() => {
            if (viewMode === 'base') {
                return <BaseView lessonid={lessonid} onCancel={onCancel} onEdit={() => setViewMode('edit')} />
            }
            else if (viewMode === 'edit') {
                return <EditView {...{
                    lessonid,
                    onCancel: () => setViewMode('base'),
                    onSuccess: () => onCloseAndRefresh?.()
                }} />
            }

            return null
        })()}

    </Dialog>

}

ApprenticeLessonDetailModal.propTypes = {

    lessonid: PT.number.isRequired,
    onCancel: PT.func.isRequired,
    onCloseAndRefresh: PT.func
}

export default ApprenticeLessonDetailModal