import React, { useState } from 'react'

import { Modal, Button, Form } from 'react-bootstrap'
import client from '../apolloclient'

import { CHANGE_PLAN_TOTALCOST } from '../common/gql_defs'
import numeral from 'numeral'


export default function TotalCostEditModal(props) {


    const [totalCost, setTotalCost] = useState(props.totalcost)
    
    const submit = ()=>{

        console.log('aa')
        let v = {
            planid: props.planid,
            totalcost: parseInt(totalCost)
        }

        console.log(v)

        client.mutate({
            mutation: CHANGE_PLAN_TOTALCOST,
            variables: v,
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)
            if(res.data.change_plan_totalcost.success){
                props.onSuccess?.()
            }
            else{
                alert('update totalcost fail')
            }
        }).catch(e=>{
            console.log(JSON.stringify(e))
            alert('update totalcost error')
        })

    }

    const get_per_ticket_cost_str = ()=>{
        
        if(props.rounds>0){
            return numeral(Math.ceil(totalCost / props.rounds)).format('0,0')
        }
        else{
            return '0'
        }
    }

    return (
        <Modal show={true} onHide={props.onCancel}>
            <Modal.Body>
                <div>
                    <span>새로운 총액</span>
                    <Form.Control value={numeral(totalCost).format('0,0')} onChange={e => {
                        let val = e.target.value.replace(/[^0-9]/g,'')
                        
                        setTotalCost(val)
                }} />
                </div>
                <div>
                    <span>회당 단가: {get_per_ticket_cost_str()}원</span>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e => props.onCancel?.()}>취소</Button>
                <Button onClick={_ => submit()}>변경</Button>
            </Modal.Footer>
        </Modal>
    )
}