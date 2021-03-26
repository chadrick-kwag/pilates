import React from 'react'
import { Modal, Button, Table, Spinner } from 'react-bootstrap'
import moment from 'moment'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID, QUERY_SUBSCRIPTION_INFO_WITH_TICKET_INFO } from '../common/gql_defs'

import TicketListComponent from './TicketListComponent'
import client from '../apolloclient'

import { DateTime } from 'luxon'

import TotalCostEditModal from './TotalCostEditModal'
import numeral from 'numeral'



class ViewSubscriptionDetailModal extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            clientid: null,
            clientname: null,
            created: null,
            rounds: null,
            totalcost: null,
            activity_type: null,
            grouping_type: null,
            tickets: null,
            show_totalcost_edit: false
        }

        this.fetch_tickets = this.fetch_tickets.bind(this)
        this.fetch_plan_data = this.fetch_plan_data.bind(this)
    }

    componentDidMount() {
        this.fetch_plan_data()
        // this.fetch_tickets()
    }


    fetch_plan_data() {
        console.log('fetch plan data')
        console.log(this.props)
        client.query({
            query: QUERY_SUBSCRIPTION_INFO_WITH_TICKET_INFO,
            variables: {
                id: this.props.data.id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.query_subscription_info_with_ticket_info.success) {
                console.log('success')
                let plan_data = res.data.query_subscription_info_with_ticket_info.subscription_info

                let tickets = plan_data.tickets

                let new_tickets = []

                tickets.forEach(d => {
                    d.created_date = DateTime.fromISO(d.created_date).setZone('UTC+9')
                    d.expire_time = DateTime.fromISO(d.expire_time).setZone('UTC+9')
                    if (d.destroyed_date !== null) {
                        d.destroyed_date = DateTime.fromISO(d.destroyed_date).setZone('UTC+9')
                    }

                    if (d.consumed_date !== null) {
                        d.consumed_date = DateTime.fromISO(d.consumed_date).setZone('UTC+9')
                    }
                    // console.log(d.created_date)
                    new_tickets.push(d)
                })
                console.log('new tickets')
                console.log(new_tickets)

                this.setState({
                    id: plan_data.id,
                    clientid: plan_data.clientid,
                    clientname: plan_data.clientname,
                    totalcost: plan_data.totalcost,
                    rounds: plan_data.rounds,
                    created: plan_data.created,
                    grouping_type: plan_data.grouping_type,
                    activity_type: plan_data.activity_type,
                    tickets: new_tickets
                })
            }
            else {
                alert('fetch info fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            console.log(e)
            alert('fetch info error')
        })
    }


    fetch_tickets() {
        client.query({
            query: FETCH_TICKETS_FOR_SUBSCRIPTION_ID,
            variables: {
                subscription_id: this.props.data.id
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            if (d.data.fetch_tickets_for_subscription_id.success) {

                let plan_data = d.data.fetch_tickets_for_subscription_id
                this.setState({
                    tickets: d.data.fetch_tickets_for_subscription_id.tickets
                })
            }
            else {
                alert('failed to fetch tickets')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))

            alert('error fetching tickets')
        })
    }

    render() {

        console.log(this.state)

        return <><Modal dialogClassName="modal-90w" show={true} onHide={e => { this.props.onCancel() }}>
            <Modal.Body>


                <Table className="view-kv-table">
                    <tr>
                        <td>subscription id</td>
                        <td>{this.props.data.id}</td>
                    </tr>
                    <tr>
                        <td>회원명</td>
                        <td>{this.state.clientname}</td>
                    </tr>
                    <tr>
                        <td>수업운동</td>
                        <td>{activity_type_to_kor[this.state.activity_type]}</td>
                    </tr>
                    <tr>
                        <td>수업인원</td>
                        <td>{grouping_type_to_kor[this.state.grouping_type]}</td>
                    </tr>
                    <tr>
                        <td>총횟수</td>
                        <td>{this.state.rounds}</td>
                    </tr>
                    <tr>
                        <td>총액</td>
                        <td>{numeral(this.state.totalcost).format('0,0') + '원'}  <span>(회당단가: {numeral(Math.ceil(this.state.totalcost / this.state.rounds)).format('0,0')}원)</span> <Button onClick={_ => this.setState({ show_totalcost_edit: true })}>수정</Button></td>
                    </tr>
                    <tr>
                        <td>생성일</td>
                        <td>{moment(new Date(parseInt(this.state.created))).format('YYYY-MM-DD HH:mm')}</td>
                    </tr>

                    <tr>
                        <td>소진내역</td>
                        <td><TicketListComponent planid={this.props.data.id} tickets={this.state.tickets} refreshdata={this.fetch_plan_data} /></td>
                    </tr>


                </Table>

            </Modal.Body>
            <Modal.Footer>
                <div>
                    <Button onClick={e => this.props.onCancel()}>cancel</Button>
                </div>
            </Modal.Footer>
        </Modal>
            {this.state.show_totalcost_edit ? <TotalCostEditModal planid={this.props.data.id}
                totalcost={this.state.totalcost} rounds={this.state.rounds}
                onCancel={_ => this.setState({ show_totalcost_edit: false })}
                onSuccess={_ => this.setState({
                    show_totalcost_edit: false
                }, this.fetch_plan_data)} /> : null}
        </>
    }


}

export default ViewSubscriptionDetailModal