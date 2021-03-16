import React from 'react'
import { Modal, Button, Table, Spinner } from 'react-bootstrap'
import moment from 'moment'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID } from '../common/gql_defs'

import TicketListComponent from './TicketListComponent'
import client from '../apolloclient'



class ViewSubscriptionDetailModal extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            tickets: null
        }

        this.fetch_tickets = this.fetch_tickets.bind(this)
    }

    componentDidMount() {
        this.fetch_tickets()
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

        return <Modal dialogClassName="modal-90w" show={true} onHide={e => { this.props.onCancel() }}>
            <Modal.Body>


                <Table className="view-kv-table">
                    <tr>
                        <td>subscription id</td>
                        <td>{this.props.data.id}</td>
                    </tr>
                    <tr>
                        <td>회원명</td>
                        <td>{this.props.data.clientname}</td>
                    </tr>
                    <tr>
                        <td>수업운동</td>
                        <td>{activity_type_to_kor[this.props.data.activity_type]}</td>
                    </tr>
                    <tr>
                        <td>수업인원</td>
                        <td>{grouping_type_to_kor[this.props.data.grouping_type]}</td>
                    </tr>
                    <tr>
                        <td>총횟수</td>
                        <td>{this.props.data.rounds}</td>
                    </tr>
                    <tr>
                        <td>총액</td>
                        <td>{this.props.data.totalcost.format() + '원'}</td>
                    </tr>
                    <tr>
                        <td>생성일</td>
                        <td>{moment(new Date(parseInt(this.props.data.created))).format('YYYY-MM-DD HH:mm')}</td>
                    </tr>

                    <tr>
                        <td>소진내역</td>
                        <td><TicketListComponent tickets={this.state.tickets} refreshdata={this.fetch_tickets} /></td>
                    </tr>


                </Table>

            </Modal.Body>
            <Modal.Footer>
                <div>
                    <Button onClick={e => this.props.onCancel()}>cancel</Button>
                </div>
            </Modal.Footer>
        </Modal>
    }


}

export default ViewSubscriptionDetailModal