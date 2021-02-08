import React from 'react'
import { Form, Modal, Button, Table, Spinner } from 'react-bootstrap'

import moment from 'moment'
import { UPDATE_CLIENT_INFO_GQL, FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID, QUERY_CLIENTINFO_BY_CLIENTID } from '../common/gql_defs'

import { extract_date_from_birthdate_str } from './CreateClientPage'

import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import { KeyboardDatePicker } from "@material-ui/pickers";
import client from '../apolloclient'



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

class ClientDetailModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            base_client: null,
            edit_mode: false,
            edit_client: null,
            subscription_info_arr: null

        }

        this.check_edit_inputs = this.check_edit_inputs.bind(this)
        this.fetch_subscription_info = this.fetch_subscription_info.bind(this)
        this.fetch_clientinfo = this.fetch_clientinfo.bind(this)
    }

    componentDidMount() {
        this.fetch_clientinfo()
    }

    fetch_clientinfo() {
        client.query({
            query: QUERY_CLIENTINFO_BY_CLIENTID,
            variables: {
                clientid: this.props.clientid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.query_clientinfo_by_clientid.success) {
                let savedata = res.data.query_clientinfo_by_clientid.client

                // manually change birthdate to Date object if exists
                if (savedata.birthdate !== null) {
                    let b = new Date(parseInt(savedata.birthdate))
                    savedata.birthdate = b
                }

                this.setState({
                    base_client: savedata
                })
                this.fetch_subscription_info()
            }
            else {
                alert('fetch client info failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch client info error')
        })
    }

    fetch_subscription_info() {


        client.query({
            query: FETCH_ALL_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
            variables: {
                clientid: this.props.clientid
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)

            if (d.data.query_all_subscriptions_with_remainrounds_for_clientid.success) {
                this.setState({
                    subscription_info_arr: d.data.query_all_subscriptions_with_remainrounds_for_clientid.allSubscriptionsWithRemainRounds
                })
            }
            else {
                alert('failed to get subscription data')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))

            alert('fetching subscription data error')
        })
    }


    check_edit_inputs() {
        // return null if all pass
        // do input checks

        if (this.state.edit_client.name.trim() == "") {
            return "invalid name"
        }

        if (this.state.edit_client.phonenumber.trim() == "") {
            return 'invalid phonenumber'
        }

        if ((this.state.edit_client.birthdate instanceof String) && (this.state.edit_client.birthdate.trim() === "")) {
            return 'invalid birthdate'
        }

        if ((this.state.edit_client.birthdate instanceof Date) && (isNaN(this.state.edit_client.birthdate))) {
            return 'invalid birthdate'
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
        if (this.state.edit_client.birthdate === null) {
            prep_birthdate = null
        }
        else if ((this.state.edit_client.birthdate instanceof String)) {
            prep_birthdate = this.state.edit_client.birthdate.trim()
        }
        else if ((this.state.edit_client.birthdate instanceof Date)) {
            prep_birthdate = this.state.edit_client.birthdate.toUTCString()
        }

        console.log(prep_birthdate)

        client.mutate({
            mutation: UPDATE_CLIENT_INFO_GQL,
            variables: {
                id: parseInt(this.state.edit_client.id),
                name: this.state.edit_client.name,
                phonenumber: this.state.edit_client.phonenumber,
                address: this.state.edit_client.address,
                email: this.state.edit_client.email,
                gender: this.state.edit_client.gender,
                memo: this.state.edit_client.memo,
                job: this.state.edit_client.job,
                birthdate: prep_birthdate


            }
        }).then(d => {
            console.log(d)

            if (d.data.update_client.success) {
                // exit edit mode and refetch data
                this.setState({
                    edit_client: null,
                    edit_mode: false,
                    base_client: null
                }, () => {
                    this.fetch_clientinfo()
                })
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
            // edit mode

            body = <Table className="view-kv-table">
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
                    <td>성별</td>
                    <td>
                        <div>
                            <Button variant={this.state.edit_client.gender === 'male' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_client = this.state.edit_client
                                    updated_client.gender = 'male'

                                    this.setState({
                                        edit_client: updated_client
                                    })
                                }}
                            >남</Button>
                            <Button variant={this.state.edit_client.gender === 'female' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_client = this.state.edit_client
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
                    <td>
                        <KeyboardDatePicker
                            placeholder="19901127"
                            value={this.state.edit_client.birthdate}
                            onChange={date => {
                                console.log(date)
                                let newclient = {}
                                Object.assign(newclient, this.state.edit_client)
                                newclient.birthdate = date
                                this.setState({
                                    edit_client: newclient
                                })
                            }}
                            format="yyyyMMdd"
                        />
                    </td>
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
                <tr>
                    <td>주소</td>
                    <td>
                        <Form.Control value={this.state.edit_client.address} onChange={e => {
                            let newclient = this.state.edit_client
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
                        <Form.Control value={this.state.edit_client.email} onChange={e => {
                            let newclient = this.state.edit_client
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
                        <Form.Control value={this.state.edit_client.job} onChange={e => {
                            let newclient = this.state.edit_client
                            newclient.job = e.target.value
                            this.setState({
                                edit_client: newclient
                            })
                        }} />

                    </td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td><Form.Control as='textarea' rows='5' value={this.state.edit_client.memo} onChange={e => {
                        let newclient = this.state.edit_client
                        newclient.memo = e.target.value
                        this.setState({
                            edit_client: newclient
                        })

                    }} /></td>
                </tr>


            </Table>
        }
        else {
            // not in edit mode

            if (this.state.base_client === null) {
                body = <div>
                    <Spinner animation='border'/>
                </div>
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
                        <td>{this.state.base_client.id}</td>
                    </tr>
                    <tr>
                        <td>이름</td>
                        <td>{this.state.base_client.name}</td>
                    </tr>
                    <tr>
                        <td>성별</td>
                        <td>{convert_gender_type_to_kor_str(this.state.base_client.gender)}</td>
                    </tr>
                    <tr>
                        <td>생년월일</td>
                        <td>{
                            // this.state.base_client.birthdate == null ? null : moment(new Date(parseInt(this.props.client.birthdate))).format('YYYY-MM-DD')
                            this.state.base_client.birthdate == null ? null : moment(this.state.base_client.birthdate).format('YYYY-MM-DD')
                        }</td>
                    </tr>
                    <tr>
                        <td>연락처</td>
                        <td>{this.state.base_client.phonenumber}</td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>{this.state.base_client.address}</td>
                    </tr>
                    <tr>
                        <td>이메일</td>
                        <td>{this.state.base_client.email}</td>
                    </tr>
                    <tr>
                        <td>직업</td>
                        <td>{this.state.base_client.job}</td>
                    </tr>
                    <tr>
                        <td>등록일</td>
                        <td>{moment(new Date(parseInt(this.state.base_client.created))).format('YYYY-MM-DD HH:mm')}</td>
                    </tr>
                    <tr>
                        <td>메모</td>
                        <td><Form.Control readOnly value={this.state.base_client.memo} as='textarea' readOnly rows='5' /></td>
                    </tr>
                    <tr>
                        <td>플랜목록</td>
                        <td>{plan_list_comp}</td>
                    </tr>


                </Table>
            }



        }

        // setup footer
        let footer = null

        if (this.state.edit_mode) {
            // edit mode
            footer = <div className='footer'>
                <Button onClick={e => {

                    this.setState({
                        edit_mode: false,
                        edit_client: null
                    })
                }}>cancel</Button>
                <Button onClick={e => this.onsubmit()}>submit</Button>
            </div>
        }
        else {
            // not edit mode
            footer = <div className='footer'>
                <Button onClick={e => this.props.onCancel()}>Back</Button>
                <Button variant='warning' onClick={e => this.setState({
                    edit_mode: true,
                    edit_client: _.cloneDeep(this.state.base_client)
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

export default ClientDetailModal