import React from 'react'
import { Form, Button, Table } from 'react-bootstrap'
import moment from 'moment'

import {CREATE_CLIENT_GQL} from '../common/gql_defs'



function extract_date_from_birthdate_str(bd_str) {

    console.log('inside extract_date_from_birthdate_str')

    try {
        let _bd_str = bd_str.trim()

        if (_bd_str.length != 8) {
            return null
        }

        let year_str = _bd_str.slice(0, 4)
        let month_str = _bd_str.slice(4, 6)
        let day_str = _bd_str.slice(6, 8)


        let month = parseInt(month_str) - 1
        let day = parseInt(day_str)


        if (day > 31) {
            return null
        }

        if(month <0 || month > 11){
            return null
        }

        let output = moment()
        output.year(year_str)
        output.month(month)
        output.date(day_str)


        return output

    } catch (err) {
        console.log(err)
        return null
    }
}

class CreateClientPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name: "",
            phonenumber: "",
            email: "",
            gender: null,
            job: "",
            address: "",
            memo: "",
            birthdate: ""


        }

        this.submitcallback = this.submitcallback.bind(this)
    }



    check_input() {

        // necessary values

        if (this.state.name.trim() == "") {
            return 'invalid name'
        }

        if (this.state.phonenumber.trim() == "") {
            return 'invalid phone number'
        }
        if (this.state.birthdate.trim() != "") {
            if (extract_date_from_birthdate_str(this.state.birthdate) == null) {
                return 'invalid birthdate'
            }

        }

        return null
    }


    submitcallback() {


        let check_msg = this.check_input()

        if (check_msg != null) {
            return alert('invalid input\n' + check_msg)
        }

        let birthdate_str
        if(this.state.birthdate===null || this.state.birthdate.trim()===""){
            birthdate_str = ""
        }
        else{
            let birthdate_date = extract_date_from_birthdate_str(this.state.birthdate)
            birthdate_str = birthdate_date.toDate().toUTCString()
        }
        
        // console.log(birthdate_date)

        
        // let birthdate_str = birthdate_date.toDate().toUTCString()


        let _variables = {
            name: this.state.name,
            phonenumber: this.state.phonenumber,
            job: this.state.job,
            address: this.state.address,
            gender: this.state.gender,
            memo: this.state.memo,
            birthdate: birthdate_str,
            email: this.state.email


        }

        console.log(_variables)

        this.props.apolloclient.mutate({
            mutation: CREATE_CLIENT_GQL,
            variables: _variables 
        }).then(d => {
            console.log(d)
            if (d.data.createclient.success) {
                this.props.onSubmitSuccess()
            }
            else {
                this.props.onSubmitFail()
            }
            // this.props.changeViewMode('list_client')
        })
            .catch(e => {
                console.log(e)
                console.log(JSON.stringify(e))
                // alert('failed to reigster client')
                this.props.onSubmitFail()
            })
    }


    render() {
        return <div>
            <div>
                회원생성
            </div>

            <div>
                <Table className="view-kv-table">
                    <tr>
                        <td>이름*</td>
                        <td><Form.Control value={this.state.name} onChange={e => {
                            this.setState({
                                name: e.target.value
                            })
                        }} /></td>
                    </tr>
                    <tr>
                        <td>성별</td>
                        <td>
                            <div>
                                <Button variant={this.state.gender == 'male' ? 'warning' : 'light'}
                                    onClick={e => {
                                        this.setState({
                                            gender: "male"
                                        })
                                    }}
                                >남</Button>
                                <Button variant={this.state.gender == 'female' ? 'warning' : 'light'}
                                    onClick={e => {
                                        this.setState({
                                            gender: "female"
                                        })
                                    }}
                                >여</Button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>생년월일</td>
                        <td><Form.Control value={this.state.birthdate} onChange={e => {
                            this.setState({
                                birthdate: e.target.value
                            })
                        }} /></td>
                    </tr>
                    <tr>
                        <td>연락처*</td>
                        <td><Form.Control value={this.state.phonenumber} onChange={e => {
                            this.setState({
                                phonenumber: e.target.value
                            })
                        }} /></td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>
                            <Form.Control value={this.state.address} onChange={e => {
                                this.setState({
                                    address: e.target.value
                                })
                            }} />
                        </td>
                    </tr>
                    <tr>
                        <td>이메일</td>
                        <td>
                            <Form.Control value={this.state.email} onChange={e => {
                                this.setState({
                                    email: e.target.value
                                })
                            }} />

                        </td>
                    </tr>
                    <tr>
                        <td>직업</td>
                        <td>
                            <Form.Control value={this.state.job} onChange={e => {
                                this.setState({
                                    job: e.target.value
                                })
                            }} />

                        </td>
                    </tr>
                    <tr>
                        <td>메모</td>
                        <td><Form.Control as='textarea' rows='5' value={this.state.memo} onChange={e => {
                            this.setState({
                                memo: e.target.value
                            })

                        }} /></td>
                    </tr>


                </Table>

            </div>
            <div>
                <Button onClick={e => this.props.cancelBtnCallback()}>cancel</Button>
                <Button onClick={e => this.submitcallback()}>submit</Button>
            </div>
        </div>
    }
}

export default CreateClientPage

export {
    extract_date_from_birthdate_str
}