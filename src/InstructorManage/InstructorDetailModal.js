import React from 'react'
import { Form, Modal, Button, Table, Spinner } from 'react-bootstrap'
import _ from 'lodash'
import moment from 'moment'
import {UPDATE_INSTRUCTOR_INFO_GQL} from '../common/gql_defs'

import { extract_date_from_birthdate_str } from './CreateClientPage'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'



function convert_gender_type_to_kor_str(gender_type_str) {
    if (gender_type_str == null) {
        return null
    }
    else if (gender_type_str.toLowerCase() == 'male') {
        return '남'
    }
    else if (gender_type_str.toLowerCase() == 'female') {
        return '여'
    }

    return null
}

class InstructorDetailModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            base_instructor: this.props.instructor,
            edit_mode: false,
            edit_instructor: this.modify_prop_instructor_for_init_edit_instructor(_.cloneDeep(this.props.instructor)),
            

        }



        this.check_edit_inputs = this.check_edit_inputs.bind(this)
    }


    modify_prop_instructor_for_init_edit_instructor(instructor) {
        if (instructor.birthdate) {
            instructor.birthdate = moment(new Date(parseInt(instructor.birthdate))).format('YYYYMMDD')
        }

        return instructor
    }

    check_edit_inputs() {
        // return null if all pass
        // do input checks

        if (this.state.edit_instructor.name.trim() == "") {
            return "invalid name"
        }

        if (this.state.edit_instructor.phonenumber.trim() == "") {
            return 'invalid phonenumber'
        }

        if (this.state.edit_instructor.birthdate != null) {
            if (extract_date_from_birthdate_str(this.state.edit_instructor.birthdate) == null) {
                return 'invalid birthdate'
            }
        }

        return null
    }

    onsubmit() {
        let check = this.check_edit_inputs()

        if (check != null) {
            alert('invalid input\n' + check)
            return
        }

        // submit to server

        let prep_birthdate = null
        if (this.state.edit_instructor.birthdate) {
            prep_birthdate = extract_date_from_birthdate_str(this.state.edit_instructor.birthdate)
        }

        this.props.apolloclient.mutate({
            mutation: UPDATE_INSTRUCTOR_INFO_GQL,
            variables: {
                id: parseInt(this.state.edit_instructor.id),
                name: this.state.edit_instructor.name,
                phonenumber: this.state.edit_instructor.phonenumber,
                address: this.state.edit_instructor.address,
                email: this.state.edit_instructor.email,
                gender: this.state.edit_instructor.gender,
                memo: this.state.edit_instructor.memo,
                job: this.state.edit_instructor.job,
                birthdate: prep_birthdate,
                is_apprentice: this.state.edit_instructor.is_apprentice,
                validation_date: this.state.edit_instructor.validation_date,
                level: this.state.edit_instructor.level

            }
        }).then(d => {
            console.log(d)

            if (d.data.update_client.success) {
                console.log('update success')
                this.props.onEditSuccess()
            }
            else {
                alert('edit update failed\n' + d.data.update_client.msg)
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))

            alert('update error')
        })

    }


    render() {

        let body = null

        if (this.state.edit_mode) {
            body = <Table className="view-kv-table">
                <tr>
                    <td>이름</td>
                    <td><Form.Control value={this.state.edit_instructor.name} onChange={e => {
                        let updated_client = this.state.edit_instructor
                        updated_client.name = e.target.value

                        this.setState({
                            edit_client: updated_client
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>성별</td>
                    <td>
                        <div>
                            <Button variant={this.state.edit_instructor.gender == 'male' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_client = this.state.edit_instructor
                                    updated_client.gender = 'male'

                                    this.setState({
                                        edit_client: updated_client
                                    })
                                }}
                            >남</Button>
                            <Button variant={this.state.edit_instructor.gender == 'female' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_client = this.state.edit_instructor
                                    updated_client.gender = 'female'
                                    console.log('updated_client')
                                    console.log(updated_client)

                                    this.setState({
                                        edit_client: updated_client
                                    })
                                }}
                            >여</Button>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td><Form.Control value={this.state.edit_instructor.birthdate} onChange={e => {
                        let newclient = this.state.edit_instructor
                        newclient.birthdate = e.target.value
                        this.setState({
                            edit_client: newclient
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>연락처</td>
                    <td><Form.Control value={this.state.edit_instructor.phonenumber} onChange={e => {
                        let updated_client = this.state.edit_instructor
                        updated_client.phonenumber = e.target.value

                        this.setState({
                            edit_client: updated_client
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>주소</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.address} onChange={e => {
                            let newclient = this.state.edit_instructor
                            newclient.address = e.target.value
                            this.setState({
                                edit_client: newclient
                            })
                        }} />
                    </td>
                </tr>
                <tr>
                    <td>이메일</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.email} onChange={e => {
                            let newclient = this.state.edit_instructor
                            newclient.email = e.target.value
                            this.setState({
                                edit_client: newclient
                            })
                        }} />

                    </td>
                </tr>
                <tr>
                    <td>직업</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.job} onChange={e => {
                            let newclient = this.state.edit_instructor
                            newclient.job = e.target.value
                            this.setState({
                                edit_client: newclient
                            })
                        }} />

                    </td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td><Form.Control as='textarea' rows='5' value={this.state.edit_instructor.memo} onChange={e => {
                        let newclient = this.state.edit_instructor
                        newclient.memo = e.target.value
                        this.setState({
                            edit_client: newclient
                        })

                    }} /></td>
                </tr>


            </Table>
        }
        else {

            let plan_list_comp = <div>
                <Spinner animation='border' />
            </div>

            if (this.state.subscription_info_arr != null) {
                if (this.state.subscription_info_arr.length == 0) {
                    plan_list_comp = <div>
                        <span>no plans found</span>
                    </div>
                }
                else {

                    plan_list_comp = <Table>
                        <thead>
                            <th>생성일</th>
                            <th>종류</th>
                            <th>rounds</th>
                        </thead>
                        <tbody>
                            {this.state.subscription_info_arr.map(d => <tr>
                                <td>{moment(new Date(d.created)).format('YYYY-MM-DD HH:mm')}</td>
                                <td>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</td>
                                <td>{d.remain_rounds}/{d.total_rounds}</td>
                            </tr>)}
                        </tbody>
                    </Table>
                }
            }


            body = <Table className="view-kv-table">
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
                    <td>{convert_gender_type_to_kor_str(this.props.client.gender)}</td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td>{
                        this.props.client.birthdate == null ? null : moment(new Date(parseInt(this.props.client.birthdate))).format('YYYY-MM-DD')
                    }</td>
                </tr>
                <tr>
                    <td>연락처</td>
                    <td>{this.props.client.phonenumber}</td>
                </tr>
                <tr>
                    <td>주소</td>
                    <td>{this.props.client.address}</td>
                </tr>
                <tr>
                    <td>이메일</td>
                    <td>{this.props.client.email}</td>
                </tr>
                <tr>
                    <td>직업</td>
                    <td>{this.props.client.job}</td>
                </tr>
                <tr>
                    <td>등록일</td>
                    <td>{moment(new Date(parseInt(this.props.client.created))).format('YYYY-MM-DD HH:mm')}</td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td><Form.Control readOnly value={this.props.client.memo} as='textarea' rows='5' /></td>
                </tr>
                <tr>
                    <td>플랜목록</td>
                    <td>{plan_list_comp}</td>
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
                <Button onClick={e => this.onsubmit()}>submit</Button>
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


        return <Modal dialogClassName="modal-90w" show={true} onHide={e => this.props.onCancel()}>

            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                {footer}
            </Modal.Footer>
        </Modal>
    }
}

export default InstructorDetailModal