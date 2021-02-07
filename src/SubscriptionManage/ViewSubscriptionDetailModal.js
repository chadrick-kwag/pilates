import React from 'react'
import { Modal, Button, Table, Spinner } from 'react-bootstrap'
import moment from 'moment'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { FETCH_TICKETS_FOR_SUBSCRIPTION_ID } from '../common/gql_defs'



function get_null_safe_date_format(val, nullval = '') {
    if (val == null) {
        return nullval
    }

    return moment(new Date(parseInt(val))).format('YYYY-MM-DD HH:mm')
}


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
        this.props.apolloclient.query({
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


        let ticket_area = <div><Spinner animation='border' /></div>

        if (this.state.tickets != null) {
            if (this.state.tickets.length == 0) {
                ticket_area = <div>no tickets found</div>
            }
            else {

                let total_tickets = this.state.tickets.length
                let consumed_count = 0

                this.state.tickets.forEach(a => {
                    if (a.consumed_date !== null) {
                        consumed_count += 1
                    }
                })


                ticket_area =
                    <div>
                        <div>
                            <span>전체횟수: {total_tickets} / 소모횟수: {consumed_count} / 잔여횟수: {total_tickets - consumed_count}</span>
                        </div>

                        <Table >

                            <thead>
                                <th>#</th>
                                <th>expire time</th>
                                <th>created</th>
                                <th>consumed by</th>
                                <th>destroyed</th>
                            </thead>
                            <tbody>
                                {this.state.tickets.map((d, index) => {
                                    let tr_classname = ""
                                    let expire_date = new Date(parseInt(d.expire_time))
                                    if (expire_date < new Date()) {
                                        tr_classname = "table-row-expired"
                                    }
                                    return <tr className={tr_classname}>
                                        <td>{index + 1}</td>
                                        <td>{get_null_safe_date_format(d.expire_time, '-')}</td>
                                        <td>{get_null_safe_date_format(d.created_date, '-')}</td>
                                        <td>{get_null_safe_date_format(d.consumed_date, '-')}</td>
                                        <td>{get_null_safe_date_format(d.destroyed_date, '-')}</td>
                                    </tr>
                                })}
                            </tbody>

                        </Table></div>
            }
        }

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
                        <td>{ticket_area}</td>
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