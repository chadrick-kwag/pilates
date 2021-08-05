import React, { useState } from 'react'

import { DialogContent, DialogActions, Button, Table, TableRow, TableCell, List, ListItem, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';


export default function BaseView(props) {
    
    console.log('baseview')
    console.log(props)

    return (
        <>
            <DialogContent>
                <Table>
                    <TableRow>
                        <TableCell>
                            회원
                        </TableCell>
                        <TableCell>
                            {props.clientname}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            티켓
                        </TableCell>
                        <TableCell>
                            {props.tickets.length > props.totalLimit ? <span style={{
                                color: 'red'
                            }}>{props.totalLimit}개가 되도록 삭제해주세요</span> : null}
                            <List>
                                {props.tickets.map((d, i) => <ListItem >
                                    <div>
                                        <span>id: {d}</span>
                                    </div>
                                    <IconButton onClick={() => {
                                        const new_tickets = [...props.tickets]
                                        new_tickets.splice(i, 1)

                                        props.setTickets(new_tickets)
                                    }}>

                                        <CloseIcon />
                                    </IconButton>

                                </ListItem>)}
                                {props.tickets.length < props.totalLimit ? <ListItem>
                                    <IconButton onClick={() => props.onAddClick?.()}>
                                        <AddIcon />
                                    </IconButton>
                                </ListItem> : null}

                            </List>
                        </TableCell>
                    </TableRow>
                </Table>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onCancel?.()}>취소</Button>
                <Button
                    disabled={props.tickets.length > props.totalLimit}
                    onClick={() => {

                        props.onEditDone?.()
                    }}>변경</Button>
            </DialogActions>
        </>
    )
}