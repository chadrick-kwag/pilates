import React, { useState, useEffect } from 'react'

import { InputAdornment, Input, TextField, Radio, Grid, Table, TableRow, TableCell, Checkbox, Button, FormControlLabel, DialogActions } from '@material-ui/core'

import ClientSearchComponent from '../../components/ClientSearchComponent4'
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import { calculate_days_to_expire_time } from '../../common/date_fns'

import GuideLineTable from './GuideLineTable'
import numeral from 'numeral'

import { CREATE_SUBSCRIPTION_GQL } from '../../common/gql_defs'
import apooloclient from '../../apolloclient'
import PT from 'prop-types'
import { withRouter } from 'react-router-dom'

function Base({ onSuccess, onCancel, history }) {

    const [selectedActivityTypes, setSelectedActivityTypes] = useState({})
    const [selectedGroupingType, setSelectedGroupingType] = useState(null)
    const [ticketCount, setTicketCount] = useState(null)
    const [totalCost, setTotalCost] = useState(null)
    const [expireDate, setExpireDate] = useState(null)
    const [client, setClient] = useState(null)


    const request_create_plan = () => {



        const selected_at_arr = []
        for (let a in selectedActivityTypes) {
            if (selectedActivityTypes[a]) {
                selected_at_arr.push(a)
            }
        }

        const _var = {
            clientid: client.id,
            activity_type_arr: selected_at_arr,
            grouping_type: selectedGroupingType,
            rounds: ticketCount,
            totalcost: totalCost,
            expiredate: expireDate.toUTCString()
        }

        console.log('_var')
        console.log(_var)

        apooloclient.mutate({
            mutation: CREATE_SUBSCRIPTION_GQL,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.create_subscription.success) {
                alert('생성되었습니다.')
                onSuccess?.()
            }
            else {
                alert(`create plan failed. msg: ${res.data.create_subscription.msg}`)
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert(`create plan error`)
        })
    }


    const check_show_guideline_possible = () => {
        if (selectedGroupingType === null) {
            return false
        }

        for (let a in selectedActivityTypes) {
            if (selectedActivityTypes[a]) {
                return true
            }
        }

        return false
    }

    const check_submit_possible = () => {

        const selected_at_arr = []
        for (let a in selectedActivityTypes) {
            if (selectedActivityTypes[a]) {
                selected_at_arr.push(a)
            }
        }


        if (selected_at_arr.length === 0) {
            return false
        }

        if (selectedGroupingType === null) {
            return false
        }

        if (parseInt(totalCost) < 0) {
            return false
        }

        if (parseInt(ticketCount) <= 0) {
            return false
        }


        if (expireDate === null) {
            return false
        }

        if (client === null) {
            return false
        }

        return true
    }


    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            <div style={{ flexGrow: 1, width: '100%', maxWidth: '100%', overflowX: 'auto' }}>


                <Table>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            수업 액티비티 종류
                        </TableCell>
                        <TableCell>
                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['PILATES']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.PILATES = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='필라테스'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['GYROTONIC']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.GYROTONIC = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='자이로토닉'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['BALLET']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.BALLET = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='발레'
                            />

                            <FormControlLabel control={<Checkbox checked={selectedActivityTypes['GYROKINESIS']} onChange={e => {

                                const a = { ...selectedActivityTypes }
                                a.GYROKINESIS = e.target.checked
                                setSelectedActivityTypes(a)

                            }} />}

                                label='자이로키네시스'
                            />



                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            수업 그룹 종류
                        </TableCell>
                        <TableCell>
                            <FormControlLabel control={<Radio value='INDIVIDUAL' checked={selectedGroupingType === 'INDIVIDUAL'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='개별' />
                            <FormControlLabel control={<Radio value='SEMI' checked={selectedGroupingType === 'SEMI'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='세미' />
                            <FormControlLabel control={<Radio value='GROUP' checked={selectedGroupingType === 'GROUP'} onChange={e => setSelectedGroupingType(e.target.value)} />} label='그룹' />

                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            가격 가이드라인
                        </TableCell>
                        <TableCell>
                            {check_show_guideline_possible() ? <GuideLineTable activity_type_arr={selectedActivityTypes} grouping_type={selectedGroupingType}
                                onGuideLineSelected={g => {
                                    setTicketCount(g.rounds)
                                    setTotalCost(g.cost)

                                    // calculate new date
                                    const a = new Date()
                                    a.setTime(a.getTime() + (g.expire_days * 24 * 60 * 60 * 1000))
                                    setExpireDate(a)
                                }}
                            /> : <span>수업 액티비티/그룹을 먼저 선택해주세요</span>}
                        </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            총가격
                        </TableCell>
                        <TableCell>
                            <Input value={totalCost} onChange={e => setTotalCost(parseInt(e.target.value))} endAdornment={<InputAdornment position="end">원</InputAdornment>} />
                        </TableCell>

                    </TableRow>

                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            총횟수
                        </TableCell>
                        <TableCell>
                            <div className='children-padding row-gravity-left'>
                                <Input value={ticketCount} onChange={e => setTicketCount( e.target.value === ""? 0 :parseInt(e.target.value))} endAdornment={<InputAdornment position="end">회</InputAdornment>} />

                                {totalCost !== null && (ticketCount !== null && ticketCount > 0) ? <span>회당단가: {numeral(Math.ceil(totalCost / ticketCount)).format('0,0')}원</span> : null}
                            </div>


                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            만료기한
                        </TableCell>
                        <TableCell style={{ alignItems: 'center' }}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                <DatePicker
                                    autoOk
                                    value={expireDate}
                                    onChange={e => setExpireDate(e)}
                                    emptyLabel="날짜를 선택해주세요"

                                />
                            </MuiPickersUtilsProvider>
                            {expireDate !== null ? <span>(만료일까지 {calculate_days_to_expire_time(expireDate)}일)</span> : null}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ wordBreak: 'keep-all' }}>
                            회원
                        </TableCell>
                        <TableCell style={{ display: 'flex', flexDirection: 'row' }}>
                            <ClientSearchComponent onClientSelected={c => setClient(c)} />
                        </TableCell>
                    </TableRow>
                </Table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>

                <Button variant='outlined' onClick={() => history.goBack()}>취소</Button>
                <Button variant='outlined' disabled={!check_submit_possible()} onClick={() => request_create_plan()}>생성</Button>

            </div>



        </div>
    )

}


Base.propTypes = {
    onCancel: PT.func,
    onSuccess: PT.func

}

export default withRouter(Base)