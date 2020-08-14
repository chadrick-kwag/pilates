import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import moment from 'moment'


class ViewSubscriptionDetailModal extends React.Component {


    constructor(props) {
        super(props)


    }


    render() {

        return <Modal show={true} onHie={e => { this.props.onCancel() }}>
            <Modal.Body>
                <div className="block row-gravity-center">
                    <span className="block-header">id</span>
                    <span>{this.props.data.id}</span>

                </div>

                <div className="block row-gravity-center">
                    <span className="block-header">회원명</span>
                    <span>{this.props.data.clientname}</span>
                </div>
                <div className="block row-gravity-center">
                    <span className="block-header">횟수</span>
                    <span>{this.props.data.rounds}</span>
                </div>

                <div className="block row-gravity-center">
                    <span className="block-header">총액</span>
                    <span>{this.props.data.totalcost.format() + '원'}</span>
                </div>

                <div className="block row-gravity-center">
                    <span className="block-header">생성일</span>
                    <span>{moment(new Date(parseInt(this.props.data.created))).format('YYYY-MM-DD HH:mm')}</span>
                </div>
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