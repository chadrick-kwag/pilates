import React, { useState } from 'react'

import { Table, TableRow, TableCell, TableHead, TableBody, TextField, Button, Radio, CircularProgress, RadioGroup, FormControlLabel } from '@material-ui/core'
import client from '../../../apolloclient'

import ApprenticeInstructorSearchComponent from '../../../components/ApprenticeInstructorSearchComponent'
import { CREATE_APPRENTICE_PLAN } from '../../../common/gql_defs'

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import koLocale from "date-fns/locale/ko";
import DateFnsUtils from "@date-io/date-fns";

import { useMutation } from '@apollo/client'
import { PRICE_GUIDELINE } from './priceguideline'
import { withRouter } from 'react-router-dom'
import { DateTime } from 'luxon'

const calculate_days_to_expire_time = (et) => {
    const d = new Date()
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)

    console.log(d)

    const t = new Date(et)

    t.setHours(0)
    t.setMinutes(0)
    t.setSeconds(0)
    t.setMilliseconds(0)

    console.log(t)

    let diff = t.getTime() - d.getTime()

    console.log(diff)

    diff = Math.floor(diff / (1000 * 60 * 60 * 24))

    console.log(diff)

    return diff

}

const get_guideline_comp = (activity_type, grouping_type, onSelectCallback) => {

    let prices = PRICE_GUIDELINE[grouping_type][activity_type]


    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>횟수</TableCell>
                <TableCell>가격</TableCell>
            </TableRow>
        </TableHead>
        {prices.map(d => <TableRow className="hover-color" onClick={e => onSelectCallback?.(d.rounds, d.cost)}>
            <TableCell>{d.rounds}회</TableCell>
            <TableCell>{d.cost}원</TableCell>
        </TableRow>)}
    </Table>
}


function CreatView({ history, match }) {

    const [appInst, setAppInst] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [totalCost, setTotalCost] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)
    const [expireTime, setExpireTime] = useState(null)


    const [createPlan, { loading, error }] = useMutation(CREATE_APPRENTICE_PLAN, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.create_apprentice_plan?.success) {
                history.push('/apprenticeplan')
            }
            else {
                alert('생성 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))

            alert('생성 에러')
        }

    })

    const is_submit_disabled = () => {
        if (appInst === null || rounds === null || totalCost === null || activityType === null || groupingType === null || expireTime === null) {
            return true
        }

        if (parseInt(rounds) <= 0) return true

        if (parseInt(totalCost) < 0) return true

        return false
    }

    const check_input = () => {
        if (appInst === null) {
            return false
        }

        if (rounds === null || parseInt(rounds) <= 0) {
            return false
        }

        if (totalCost === null || parseInt(totalCost) < 0) {
            return false
        }

        if (activityType === null) {
            return false
        }

        if (groupingType === null) {
            return false
        }

        if (expireTime === null) {
            return false
        }

        return true
    }

    const submit = () => {

        // check input
        if (!check_input()) {
            alert('invalid input')
            return
        }

        let _var = {
            apprentice_instructor_id: appInst.id,
            totalcost: parseInt(totalCost),
            rounds: parseInt(rounds),
            activity_type: activityType,
            grouping_type: groupingType,
            expiretime: DateTime.fromJSDate(expireTime).setZone('utc+9').endOf('day').toHTTP()

        }

        createPlan({
            variables: _var
        })

    }


    return (
        <div className='fwh flexcol'>
            <span className="nowb" style={{ fontSize: '2rem', fontWeight: 'bold' }}>견습생 플랜 생성</span>
            <div style={{ flex: '1 1 0' }}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>액티비티 종류</TableCell>
                            <TableCell>
                                <RadioGroup value={activityType} onChange={e => setActivityType(e.target.value)}>
                                    <FormControlLabel control={<Radio />} value="PILATES" label="필라테스" />
                                    <FormControlLabel control={<Radio />} value="GYROTONIC" label="자이로토닉" />

                                </RadioGroup>

                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                그룹 종류
                            </TableCell>
                            <TableCell>

                                <RadioGroup value={groupingType} onChange={e => setGroupingType(e.target.value)}>
                                    <FormControlLabel control={<Radio />} value="INDIVIDUAL" label="개별" />
                                    <FormControlLabel control={<Radio />} value="SEMI" label="세미" />
                                    <FormControlLabel control={<Radio />} value="GROUP" label="그룹" />
                                </RadioGroup>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                가격 가이드라인
                            </TableCell>
                            <TableCell>
                                {activityType === null || groupingType === null ? <span>수업종류, 그룹종류를 선택해주세요</span> : get_guideline_comp(activityType.toLowerCase(), groupingType.toLowerCase(), (r, t) => {
                                    setRounds(r)
                                    setTotalCost(t)
                                })}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>횟수</TableCell>
                            <TableCell>
                                <TextField value={rounds} onChange={e => setRounds(e.target.value)}></TextField>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>총비용</TableCell>
                            <TableCell>
                                <TextField value={totalCost} onChange={e => setTotalCost(e.target.value)}></TextField>
                                {totalCost !== null && rounds !== null ? <span>회당가격:{Math.ceil(totalCost / rounds)}원</span> : null}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>견습강사</TableCell>
                            <TableCell>
                                <ApprenticeInstructorSearchComponent onSelect={a => setAppInst(a)} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>만료일</TableCell>
                            <TableCell>
                                <div className='row-gravity-left children-padding'>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={koLocale}>

                                        <DatePicker
                                            autoOk
                                            value={expireTime}
                                            emptyLabel="날짜를 선택해주세요"
                                            onChange={e => setExpireTime(e)}

                                        />
                                    </MuiPickersUtilsProvider>
                                    {expireTime !== null ? <span>(만료일까지 {calculate_days_to_expire_time(expireTime)}일)</span> : null}

                                </div>

                            </TableCell>
                        </TableRow>
                    </TableBody>

                </Table>
            </div>


            <div className="flexrow justify-center align-center gap">

                <Button variant='outlined' onClick={e => history.goBack()}>취소</Button>
                <Button variant='outlined' disabled={is_submit_disabled()} onClick={e => submit()}>생성</Button>

            </div>



        </div>
    )
}


export default withRouter(CreatView)