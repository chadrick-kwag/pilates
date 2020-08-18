import React from 'react'
import { Modal, Button, Table, Spinner } from 'react-bootstrap'
import moment from 'moment'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'



class ViewSubscriptionDetailModal extends React.Component {

    render() {

        return <Modal show={true} onHide={e => { this.props.onCancel() }}>
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