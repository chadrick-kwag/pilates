import React, { useState, useEffect } from 'react'

import { QUERY_SUBSCRIPTIONS_BY_CLIENTID } from '../common/gql_defs'
import client from '../apolloclient'

import {Spinner} from 'react-bootstrap'
import { DateTime } from 'luxon'

import {activity_type_to_kor, grouping_type_to_kor} from '../common/consts'

export default function RecentPlanList(props) {


    const [state, setState] = useState({
        plan_list: null
    })


    const fetchdata = () => {
        client.query({
            query: QUERY_SUBSCRIPTIONS_BY_CLIENTID,
            variables: {
                clientid: parseInt(props.clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.query_subscriptions_by_clientid.success) {
                let newstate = _.cloneDeep(state)
                newstate.plan_list = res.data.query_subscriptions_by_clientid.subscriptions

                setState(newstate)
            }
            else {
                alert('fetch plans failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch plan error')
        })
    }


    useEffect(()=>{
        setState({
            plan_list: null
        })
        fetchdata()
    }, [props.clientid])

    

    

    return (
        <div>
            {state.plan_list === null ? <Spinner animation='border'/> : (()=>{
                if(state.plan_list.length==0){
                    return <span>no recent plan</span>
                }
                else{
                    // select latest plan
                    state.plan_list.sort((a,b)=>{
                        console.log(a)

                        if(parseInt(a.created) > parseInt(b.created)){
                            return -1
                        }
                        else{
                            return 1
                        }
                    })


                    let latest_plan = state.plan_list[0]
                    let dt = DateTime.fromMillis(parseInt(latest_plan.created))

                    return <span>가장 최근 생성된 플랜: {dt.setZone('UTC+9').toFormat('y-LL-dd HH:mm')} / {activity_type_to_kor[latest_plan.activity_type]} / {grouping_type_to_kor[latest_plan.grouping_type]}</span>
                }
            })()}
        </div>

    )

}