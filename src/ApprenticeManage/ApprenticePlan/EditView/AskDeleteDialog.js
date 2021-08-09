import React from 'react'

import { Button, Dialog, DialogContent, DialogActions } from '@material-ui/core'
import client from '../../../apolloclient'
import { DELETE_APPRENTICE_TICKETS } from '../../../common/gql_defs'
import { useMutation } from '@apollo/client'
import PT from 'prop-types'

function AskDeleteDialog({ onClose, onSuccess, ticketIds }) {

    const [deleteTickets, { loading, error }] = useMutation(DELETE_APPRENTICE_TICKETS, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.delete_apprentice_tickets?.success) {
                onSuccess?.()
            }
            else {
                alert('삭제 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('삭제 에러')
        }

    })

    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            <span>정말 선택된 티켓들을 삭제하시겠습니까?</span>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>취소</Button>
            <Button onClick={() => deleteTickets({
                variables: {
                    id_arr: ticketIds
                }
            })}>확인</Button>
        </DialogActions>
    </Dialog>
}


AskDeleteDialog.propTypes = {
    onClose: PT.func,
    ticketIds: PT.arrayOf(PT.number),
    onSuccess: PT.func
}

export default AskDeleteDialog