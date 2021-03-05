import React from 'react'
import { Form, Modal, Button, Table, Spinner, Dropdown, ToggleButton, DropdownButton, ButtonGroup } from 'react-bootstrap'
import _ from 'lodash'
import moment from 'moment'
import { UPDATE_INSTRUCTOR_INFO_GQL, FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID, FETCH_INSTRUCTOR_LEVEL_INFO } from '../common/gql_defs'

import { INSTRUCTOR_LEVEL_LIST } from '../common/consts'
import client from '../apolloclient'
import { KeyboardDatePicker } from "@material-ui/pickers";




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
            base_instructor: null,
            edit_mode: false,
            edit_instructor: null,
            level_info_list: null
        }


        this.check_edit_inputs = this.check_edit_inputs.bind(this)
        this.fetch_instructor_data = this.fetch_instructor_data.bind(this)
        this.fetch_instructor_level_info = this.fetch_instructor_level_info.bind(this)

    }

    fetch_instructor_level_info(){

        client.query({
            query: FETCH_INSTRUCTOR_LEVEL_INFO,
            fetchPolicy: 'no-cache'
        }).then(res=>{
            console.log(res)

            if(res.data.fetch_instructor_level_info.success){
                this.setState({
                    level_info_list: res.data.fetch_instructor_level_info.info_list
                })
            }
            else{
                alert('instructor level info fetch failed')
            }
        })
        .catch(e=>{
            console.log(JSON.stringify(e))
            alert('instructor level info fetch error')
        })
    }


    fetch_instructor_data() {
        client.query({
            query: FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID,
            variables: {
                id: this.props.instructorid
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_instructor_with_id.success) {
                let savedata = res.data.fetch_instructor_with_id.instructor
                console.log(savedata)
                // convert birthdate to date object if possible
                if (savedata.birthdate !== null) {
                    savedata.birthdate = new Date(parseInt(savedata.birthdate))
                }

                if (savedata.validation_date !== null) {
                    savedata.validation_date = new Date(parseInt(savedata.validation_date))
                }

                this.setState({
                    base_instructor: savedata
                })

            }
            else {
                alert('instructor info fetch failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('instructor info fetch error')
        })
    }

    componentDidMount() {
        this.fetch_instructor_data()
    }



    check_edit_inputs() {
        // return null if all pass
        // do input checks


        if (this.state.edit_instructor.name.trim() === "") {
            return "invalid name"
        }

        if (this.state.edit_instructor.phonenumber.trim() === "") {
            return 'invalid phonenumber'
        }

        if (this.state.edit_instructor.birthdate !== null) {

            if( (this.state.edit_instructor.birthdate instanceof Date) && (isNaN(this.state.edit_instructor.birthdate)) ){
                return 'invalid birthdate'
            }
            
        }

        if (this.state.edit_instructor.validation_date !== null) {

            console.log('validation date check')
            console.log(this.state.edit_instructor.validation_date)

            if( (this.state.edit_instructor.validation_date instanceof Date) && (isNaN(this.state.edit_instructor.validation_date))  ){
                return 'invalid validation date'
            }
            
        }

        return null
    }

    onsubmit() {

        console.log(this.state.edit_instructor)
        let check = this.check_edit_inputs()

        if (check !== null) {
            alert('invalid input\n' + check)
            return
        }

        // submit to server

        let prep_birthdate = null
        if (this.state.edit_instructor.birthdate!==null) {
            // prep_birthdate = extract_date_from_birthdate_str(this.state.edit_instructor.birthdate)
            prep_birthdate = this.state.edit_instructor.birthdate.toUTCString()
        }

        let prep_validation_date = null
        if (this.state.edit_instructor.validation_date!==null) {
            // prep_validation_date = extract_date_from_birthdate_str(this.state.edit_instructor.validation_date)
            prep_validation_date = this.state.edit_instructor.validation_date.toUTCString()
        }

        console.log("prep_validation_date")
        console.log(prep_validation_date)


        client.mutate({
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
                validation_date: prep_validation_date,
                level: this.state.edit_instructor.level
            }
        }).then(d => {
            console.log(d)

            if (d.data.update_instructor.success) {
                this.setState({
                    edit_mode: false,
                    edit_instructor: null,
                    base_instructor: null
                }, () => {
                    this.fetch_instructor_data()
                })
            }
            else {
                alert('edit update failed\n' + d.data.update_instructor.msg)
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
                    <td><Form.Control value={this.state.edit_instructor.name} onChange={e => {
                        let updated_instructor = this.state.edit_instructor
                        updated_instructor.name = e.target.value

                        this.setState({
                            edit_instructor: updated_instructor
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>성별</td>
                    <td>
                        <div>
                            <Button variant={this.state.edit_instructor.gender === 'MALE' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_instructor = this.state.edit_instructor
                                    updated_instructor.gender = 'MALE'

                                    this.setState({
                                        edit_instructor: updated_instructor
                                    })
                                }}
                            >남</Button>
                            <Button variant={this.state.edit_instructor.gender === 'FEMALE' ? 'warning' : 'light'}
                                onClick={e => {
                                    let updated_instructor = this.state.edit_instructor
                                    updated_instructor.gender = 'FEMALE'

                                    this.setState({
                                        edit_instructor: updated_instructor
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
                            value={this.state.edit_instructor.birthdate}
                            onChange={date => {
                                let newinstructor = {}
                                Object.assign(newinstructor, this.state.edit_instructor)
                                newinstructor.birthdate = date
                                this.setState({
                                    edit_instructor: newinstructor
                                })
                            }}
                            format="yyyyMMdd"
                        />
                    </td>
                </tr>
                <tr>
                    <td>연락처</td>
                    <td><Form.Control value={this.state.edit_instructor.phonenumber} onChange={e => {
                        let updated_instructor = this.state.edit_instructor
                        updated_instructor.phonenumber = e.target.value

                        this.setState({
                            edit_instructor: updated_instructor
                        })
                    }} /></td>
                </tr>
                <tr>
                    <td>레벨</td>
                    <td>
                        <DropdownButton title={this.state.edit_instructor.level == null ? 'select' : this.state.edit_instructor.level_string} onClick={e=>{
                            if(this.state.level_info_list===null){
                                this.fetch_instructor_level_info()
                            }
                        }}>
                            {this.state.level_info_list===null ? <Dropdown.Item>loading...</Dropdown.Item> : this.state.level_info_list.map(d=><Dropdown.Item onClick={e=>{
                                let new_inst = _.cloneDeep(this.state.edit_instructor)
                                new_inst.level = d.id
                                new_inst.level_string = d.level_string
                                this.setState({
                                    edit_instructor: new_inst
                                })

                            }}>{d.level_string}</Dropdown.Item>)}
                            {/* {INSTRUCTOR_LEVEL_LIST.map(d => <Dropdown.Item onClick={e => {
                                let updated_instructor = this.state.edit_instructor
                                updated_instructor.level = d
                                this.setState({
                                    edit_instructor: updated_instructor
                                })
                            }}>
                                {d}
                            </Dropdown.Item>)} */}
                        </DropdownButton>
                    </td>
                </tr>
               
                <tr>
                    <td>자격증취득일</td>
                    <td>

                        <KeyboardDatePicker
                            placeholder="19901127"
                            value={this.state.edit_instructor.validation_date}
                            onChange={date => {
                                let newinstructor = {}
                                Object.assign(newinstructor, this.state.edit_instructor)
                                newinstructor.validation_date = date
                                this.setState({
                                    edit_instructor: newinstructor
                                })
                            }}
                            format="yyyyMMdd"
                        />
                    </td>
                </tr>
                <tr>
                    <td>주소</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.address} onChange={e => {
                            let updated_instructor = this.state.edit_instructor
                            updated_instructor.address = e.target.value
                            this.setState({
                                edit_instructor: updated_instructor
                            })
                        }} />
                    </td>
                </tr>
                <tr>
                    <td>이메일</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.email} onChange={e => {
                            let updated_instructor = this.state.edit_instructor
                            updated_instructor.email = e.target.value
                            this.setState({
                                edit_instructor: updated_instructor
                            })
                        }} />

                    </td>
                </tr>
                <tr>
                    <td>직업</td>
                    <td>
                        <Form.Control value={this.state.edit_instructor.job} onChange={e => {
                            let updated_instructor = this.state.edit_instructor
                            updated_instructor.job = e.target.value
                            this.setState({
                                edit_instructor: updated_instructor
                            })
                        }} />

                    </td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td><Form.Control as='textarea' rows='5' value={this.state.edit_instructor.memo} onChange={e => {
                        let updated_instructor = this.state.edit_instructor
                        updated_instructor.memo = e.target.value
                        this.setState({
                            edit_instructor: updated_instructor
                        })

                    }} /></td>
                </tr>


            </Table>
        }
        else {

            // not edit mode

            if (this.state.base_instructor === null) {
                body = <div><Spinner animation='border'/></div>
            }
            else {
                body = <Table className="view-kv-table">
                    <tr>
                        <td>id</td>
                        <td>{this.state.base_instructor.id}</td>
                    </tr>
                    <tr>
                        <td>이름</td>
                        <td>{this.state.base_instructor.name}</td>
                    </tr>
                    <tr>
                        <td>성별</td>
                        <td>{convert_gender_type_to_kor_str(this.state.base_instructor.gender)}</td>
                    </tr>
                    <tr>
                        <td>생년월일</td>
                        <td>{
                            this.state.base_instructor.birthdate == null ? null : moment(this.state.base_instructor.birthdate).format('YYYY-MM-DD')
                        }</td>
                    </tr>
                    <tr>
                        <td>연락처</td>
                        <td>{this.state.base_instructor.phonenumber}</td>
                    </tr>
                    <tr>
                        <td>레벨</td>
                        <td>{this.state.base_instructor.level_string}</td>
                    </tr>
                   
                    <tr>
                        <td>자격증취득일</td>
                        <td>{this.state.base_instructor.validation_date == null ? null : moment(this.state.base_instructor.validation_date).format('YYYY-MM-DD')}</td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>{this.state.base_instructor.address}</td>
                    </tr>
                    <tr>
                        <td>이메일</td>
                        <td>{this.state.base_instructor.email}</td>
                    </tr>
                    <tr>
                        <td>직업</td>
                        <td>{this.state.base_instructor.job}</td>
                    </tr>
                    <tr>
                        <td>등록일</td>
                        <td>{moment(new Date(parseInt(this.state.base_instructor.created))).format('YYYY-MM-DD HH:mm')}</td>
                    </tr>
                    <tr>
                        <td>메모</td>
                        <td><Form.Control readOnly value={this.state.base_instructor.memo} as='textarea' rows='5' /></td>
                    </tr>

                </Table>
            }

        }


        let footer = null

        if (this.state.edit_mode) {
            footer = <div className='footer'>
                <Button onClick={e => {
                    this.setState({
                        edit_mode: false,
                        edit_instructor: null
                    })
                }}>cancel</Button>
                <Button onClick={e => this.onsubmit()}>submit</Button>
            </div>
        }
        else {
            footer = <div className='footer'>
                <Button onClick={e => this.props.onCancel()}>Back</Button>

                {this.state.base_instructor === null ? null :
                    <Button variant='warning' onClick={e => this.setState({
                        edit_mode: true,
                        edit_instructor: _.cloneDeep(this.state.base_instructor)
                    })}>edit</Button>}


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