import React from 'react'
import { Form, Modal, Button, Table } from 'react-bootstrap'
import _ from 'lodash'


class ClientDetailModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            base_client: this.props.client,
            edit_mode: false,
            edit_client: _.cloneDeep(this.props.client)

        }

        this.check_edit_inputs = this.check_edit_inputs.bind(this)
    }



    check_edit_inputs(){
        // return null if all pass
        // do input checks

        return null
    }

    onsubmit(){
        let check = this.check_edit_inputs()

        if(check!=null){
            alert('invalid input\n'+ check)
            return
        }

        // submit to server
    }


    render() {

        let body = null

        if (this.state.edit_mode) {
            body = <Table>
                <tr>
                    <td>이름</td>
                    <td><Form.Control value={this.state.edit_client.name} onChange={e => {
                        let updated_client = this.state.edit_client
                        updated_client.name = e.target.value

                        this.setState({
                            edit_client: updated_client
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>id</td>
                    <td><Form.Control value={this.state.edit_client.id} onChange={e => {
                        let updated_client = this.state.edit_client
                        updated_client.id = e.target.value

                        this.setState({
                            edit_client: updated_client
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>연락처</td>
                    <td><Form.Control value={this.state.edit_client.phonenumber} onChange={e => {
                        let updated_client = this.state.edit_client
                        updated_client.phonenumber = e.target.value

                        this.setState({
                            edit_client: updated_client
                        })
                    }} /></td>
                </tr>

            </Table>
        }
        else {
            body = <Table>
                <tr>
                    <td>id</td>
                    <td>{this.props.client.id}</td>
                </tr>
                <tr>
                    <td>이름</td>
                    <td>{this.props.client.name}</td>
                </tr>
                <tr>
                    <td>성별</td>
                    <td>{this.props.client.name}</td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td>{this.props.client.name}</td>
                </tr>
                <tr>
                    <td>연락처</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>주소</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>이메일</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>직업</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>등록일</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>플랜목록</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                

            </Table>
        }


        let footer = null

        if (this.state.edit_mode) {
            footer = <div className='footer'>
                <Button onClick={e => {

                    this.setState({
                        edit_mode: false,
                        edit_client: _.cloneDeep(this.props.client)
                    })
                }}>cancel</Button>
                <Button>submit</Button>
            </div>
        }
        else {
            footer = <div className='footer'>
                <Button onClick={e => this.props.onCancel()}>Back</Button>
                <Button variant='warning' onClick={e => this.setState({
                    edit_mode: true
                })}>edit</Button>
                
            </div>
        }


        return <Modal show={true} onHide={e => this.props.onCancel()}>

            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                {footer}
            </Modal.Footer>
        </Modal>
    }
}

export default ClientDetailModal