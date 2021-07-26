import React, { useState } from 'react'
import { Drawer, List, ListItem, Divider } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'


function MenuDrawer({ history, closeDrawer, open }) {

    return <Drawer anchor='left' open={open} onClose={() => closeDrawer()}>
        <div>
            <List component="nav">

                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/dashboard')
                }}>홈</ListItem>
                <Divider />
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/schedule')
                }}>
                    스케쥴
                </ListItem>
                <Divider />
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/clientmanage')
                }}>회원관리</ListItem>
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/planmanage')
                }}>회원플랜관리</ListItem>
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/instructormanage')
                }}>강사관리</ListItem>
                <Divider variant='fullWidth' />
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/apprenticecourse')
                }}>견습강사 과정</ListItem>
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/apprenticepersonnel')
                }}>견습강사 관리</ListItem>
                <ListItem button onClick={e => {

                    closeDrawer()
                    history.push('/apprenticeplan')
                }}>견습강사 플랜</ListItem>
                <Divider />
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/instructorstat')
                }}>강사통계</ListItem>
                <ListItem button onClick={e => {
                    closeDrawer()
                    history.push('/adminpage')
                }}>관리자설정</ListItem>

                <ListItem button onClick={() => {
                    closeDrawer()
                    history.push('/adminaccountmanage')
                }}>관리자 계정 관리</ListItem>
            </List>
        </div>

    </Drawer >
}


MenuDrawer.proptypes = {
    closeDrawer: PropTypes.func
}


export default withRouter(MenuDrawer)