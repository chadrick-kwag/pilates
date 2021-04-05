import React, { useState } from 'react'

import { Table, TableRow, TableCell, TableHead, TableBody, TextField, Button, Radio } from '@material-ui/core'
import client from '../../apolloclient'

import ApprenticeInstructorSearchComponent from '../../components/ApprenticeInstructorSearchComponent'
import {CREATE_APPRENTICE_PLAN} from '../../common/gql_defs'


const price_guideline = {
    individual: {
        pilates: [
            {
                rounds: 1,
                cost: 25000
            },
            {
                rounds: 10,
                cost: 200000
            },
            {
                rounds: 50,
                cost: 500000
            }
        ],
        gyrotonic: [
            {
                rounds: 1,
                cost: 25000
            },
            {
                rounds: 10,
                cost: 20000
            },
            {
                rounds: 30,
                cost: 300000
            }
        ]
    },
    semi: {
        pilates: [
            {
                rounds: 1,
                cost: 35000
            },
            {
                rounds: 10,
                cost: 300000
            }
        ],
        gyrotonic: [
            {
                rounds: 1,
                cost: 35000
            },
            {
                rounds: 10,
                cost: 300000
            }
        ]
    },
    group: {
        pilates: [
            {
                rounds: 1,
                cost: 45000
            },
            {
                rounds: 10,
                cost: 400000
            }
        ],
        gyrotonic: [
            {
                rounds: 1,
                cost: 45000
            },
            {
                rounds: 10,
                cost: 400000
            }
        ]
    }
}

const get_guideline_comp = (activity_type, grouping_type, onSelectCallback) => {

    let prices = price_guideline[grouping_type][activity_type]
    console.log(prices)

    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>횟수</TableCell>
                <TableCell>가격</TableCell>
            </TableRow>
        </TableHead>
        {prices.map(d => <TableRow onClick={e => onSelectCallback?.(d.rounds, d.cost)}>
            <TableCell>{d.rounds}회</TableCell>
            <TableCell>{d.cost}원</TableCell>
        </TableRow>)}
    </Table>
}


export default function CreateApprenticePlanComponent(props) {

    const [appInst, setAppInst] = useState(null)
    const [rounds, setRounds] = useState(null)
    const [totalCost, setTotalCost] = useState(null)
    const [activityType, setActivityType] = useState(null)
    const [groupingType, setGroupingType] = useState(null)


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
            grouping_type: groupingType

        }

        console.log(_var)

        client.mutate({
            mutation: CREATE_APPRENTICE_PLAN,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.create_apprentice_plan.success) {
                console.log('success')
                props.onSuccess?.()
            }
            else {
                alert(`create fail. msg:${res.data.create_apprentice_plan.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('create error')
        })

    }

    return (
        <div className='col-gravity-center'>
            <h2>견습생 플랜 생성</h2>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>액티비티 종류</TableCell>
                        <TableCell>
                            <div className='row-gravity-left'>
                                <Radio checked={activityType === 'PILATES'} onChange={e => setActivityType('PILATES')} />필라테스
                                <Radio checked={activityType === 'GYROTONIC'} onChange={e => setActivityType('GYROTONIC')} />자이로토닉
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            그룹 종류
                        </TableCell>
                        <TableCell>
                            <div className='row-gravity-left'>
                                <Radio checked={groupingType === 'INDIVIDUAL'} onChange={e => setGroupingType('INDIVIDUAL')} />개별
                                <Radio checked={groupingType === 'SEMI'} onChange={e => setGroupingType('SEMI')} />세미
                                <Radio checked={groupingType === 'GROUP'} onChange={e => setGroupingType('GROUP')} />그룹
                            </div>
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
                            <ApprenticeInstructorSearchComponent onSelect={a=>setAppInst(a)}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>

                    </TableRow>
                </TableBody>

            </Table>
            <div className='row-gravity-center'>
                <Button variant='outlined' color='secondary' onClick={e => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>생성</Button>

            </div>

        </div>
    )
}