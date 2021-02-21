import React from 'react'

import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import { Table, Button, Form } from 'react-bootstrap'

import { CREATE_SUBSCRIPTION_GQL } from '../common/gql_defs'


import PREDEFINED_PLANS from './PredefinedPlans'

import CheckCouponComponent from './CheckCouponComponent'
import { DatePicker } from '@material-ui/pickers'


class CreateSubscriptionView extends React.Component {

    constructor(p) {
        super(p)

        this.state = {
            activity_type: null,
            grouping_type: null,
            selected_client: null,
            coupon_backed: null,
            rounds: "",
            totalcost: "",
            expire_date: new Date()
        }

        this.check_input = this.check_input.bind(this)
        this.submit = this.submit.bind(this)
    }

    check_input() {

        if (this.state.activity_type == null) {
            return false
        }

        if (this.state.grouping_type == null) {
            return false
        }

        if (this.state.selected_client == null) {
            return false
        }

        try {
            let int_rounds = parseInt(this.state.rounds)
            if (int_rounds <= 0) {
                return false
            }
        }
        catch (err) {
            return false
        }

        try {
            let int_totalcost = parseInt(this.state.totalcost)
            if (int_totalcost <= 0) {
                return false
            }
        }
        catch (e) {
            return false
        }

        return true
    }

    submit() {
        if (!this.check_input()) {
            return alert('invalid input')
        }

        let _expiredate = this.state.expire_date
        _expiredate.setHours(23)
        _expiredate.setMinutes(59)
        _expiredate.setSeconds(59)
        _expiredate.setMilliseconds(0)

        this.props.apolloclient.mutate({
            mutation: CREATE_SUBSCRIPTION_GQL,
            variables: {
                clientid: parseInt(this.state.selected_client.id),
                rounds: parseInt(this.state.rounds),
                totalcost: parseInt(this.state.totalcost),
                activity_type: this.state.activity_type,
                grouping_type: this.state.grouping_type,
                coupon_backed: this.state.coupon_backed,
                expiredate: _expiredate.toUTCString()
            }
        }).then(d => {
            console.log(d)
            if (d.data.create_subscription.success) {
                this.props.onSubmitSuccess()
            }
            else {
                alert('failed to create subscription')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))

            alert('error creating subscription')
        })
    }

    render() {


        let plan_guideline = null

        if (this.state.activity_type != null && this.state.grouping_type != null) {

            let guideline = PREDEFINED_PLANS[this.state.activity_type][this.state.grouping_type]

            console.log(guideline)
            plan_guideline = <div className="col-gravity-center" style={{ width: '50%' }}>
                <span>가격 가이드라인</span>
                <Table className="row-clickable-table noselect">
                    <thead>
                        <th>횟수</th>
                        <th>가격</th>
                        <th>사용기간</th>
                    </thead>
                    <tbody>
                        {guideline.map(d => <tr onClick={e => {

                            let new_date = new Date()
                            new_date.setDate(new_date.getDate() + d.expire_days)
                            this.setState({
                                rounds: d.rounds,
                                totalcost: d.cost,
                                expire_date: new_date
                            })
                        }}>
                            <td>{d.rounds + '회'}</td>
                            <td>{Number(d.cost).format() + '원'}</td>
                            <td>{d.expire_countdown}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </div>
        }

        return <div className="col-gravity-center">

            <div className="block row-gravity-center">

                <span className="block-header">그룹방식</span>
                <div className="row-gravity-center">
                    <Button variant={this.state.grouping_type == "INDIVIDUAL" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'INDIVIDUAL'
                    })}>개인</Button>
                    <Button variant={this.state.grouping_type == "SEMI" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'SEMI'
                    })}>세미</Button>
                    <Button variant={this.state.grouping_type == "GROUP" ? 'warning' : 'light'} onClick={e => this.setState({
                        grouping_type: 'GROUP'
                    })}>그룹</Button>

                </div>

            </div>

            <div className="block row-gravity-center">
                <span className="block-header">수업종류</span>

                <div className="row-gravity-center">
                    <Button variant={this.state.activity_type == "PILATES" ? 'warning' : 'light'} onClick={e => this.setState({
                        activity_type: 'PILATES'
                    })}>필라테스</Button>
                    <Button variant={this.state.activity_type == "GYROTONIC" ? 'warning' : 'light'} onClick={e => this.setState({
                        activity_type: 'GYROTONIC'
                    })}>자이로토닉</Button>
                    <Button variant={this.state.activity_type == "BALLET" ? 'warning' : 'light'} onClick={e => this.setState({
                        activity_type: 'BALLET'
                    })}>발레</Button>
                </div>

            </div>

            {plan_guideline}

            <div className="block row-gravity-center">
                <CheckCouponComponent disabled />
            </div>

            <div className="block row-gravity-center">
                <span className="block-header">총횟수</span>
                <Form.Control value={this.state.rounds} onChange={e => this.setState({
                    rounds: e.target.value
                })} />
            </div>
            <div className="block row-gravity-center">
                <span className="block-header">총가격</span>
                <Form.Control value={this.state.totalcost} onChange={e => this.setState({
                    totalcost: e.target.value
                })} />
            </div>
            <div className="block col-gravity-center">
                <span className="block-header">만료기간</span>
                <DatePicker
                    autoOk
                    orientation="landscape"
                    variant="static"
                    openTo="date"
                    value={this.state.expire_date}
                    onChange={d => {
                        console.log(d)
                        this.setState({
                            expire_date: d
                        })
                    }}
                />

            </div>

            <div className="block">
                <ClientSearchComponent2 apolloclient={this.props.apolloclient}
                    clientSelectedCallback={d => this.setState({
                        selected_client: d
                    })}
                />
            </div>

            <div className="block footer">
                <Button onClick={e => this.props.onCancelClick()}>취소</Button>
                <Button onClick={e => this.submit()}>생성</Button>
            </div>
        </div>
    }
}

export default CreateSubscriptionView