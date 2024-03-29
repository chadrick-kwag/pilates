import React from 'react'
import { Form, Button, Table, DropdownButton, Dropdown, ButtonGroup, ToggleButton, Alert } from 'react-bootstrap'
import { CircularProgress } from '@material-ui/core'
import { CREATE_INSTRUCTOR_GQL, FETCH_INSTRUCTOR_LEVEL_INFO } from '../common/gql_defs'
import { INSTRUCTOR_LEVEL_LIST } from '../common/consts'
import client from '../apolloclient'
import { KeyboardDatePicker } from "@material-ui/pickers";


class CreateInstructorPage extends React.Component {

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
            birthdate: null,
            level: null,
            validation_date: null,
            is_apprentice: null,
            instructor_level_info_arr: null
        }

        this.submitcallback = this.submitcallback.bind(this)
        this.fetch_instructor_level_info = this.fetch_instructor_level_info.bind(this)
    }

    componentDidMount() {
        this.fetch_instructor_level_info()
    }

    fetch_instructor_level_info() {

        client.query({
            query: FETCH_INSTRUCTOR_LEVEL_INFO,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_instructor_level_info.success) {
                this.setState({
                    instructor_level_info_arr: res.data.fetch_instructor_level_info.info_list
                })
            }
            else {
                alert('fetch instructor level fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch instructor level error')
        })

    }

    check_input() {

        // necessary values

        if (this.state.name.trim() == "") {
            return 'invalid name'
        }

        if (this.state.phonenumber.trim() == "") {
            return 'invalid phone number'
        }

        if (this.state.birthdate !== null && this.state.birthdate instanceof Date && isNaN(this.state.birthdate)) {
            return 'invalid birthdate'
        }

        if (this.state.validation_date !== null && this.state.validation_date instanceof Date && isNaN(this.state.validation_date)) {
            return 'invalid validation date'
        }



        return null
    }


    submitcallback() {


        let check_msg = this.check_input()

        if (check_msg != null) {
            return alert('invalid input\n' + check_msg)
        }

        let _variables = {
            name: this.state.name.trim(),
            phonenumber: this.state.phonenumber,
            job: this.state.job,
            address: this.state.address,
            gender: this.state.gender,
            memo: this.state.memo,
            birthdate: this.state.birthdate === null ? null : this.state.birthdate.toUTCString(),
            email: this.state.email,
            validation_date: this.state.validation_date === null ? null : this.state.validation_date.toUTCString(),
            level: this.state.level,
            is_apprentice: this.state.is_apprentice

        }

        console.log(_variables)

        client.mutate({
            mutation: CREATE_INSTRUCTOR_GQL,
            variables: _variables
        }).then(d => {
            console.log(d)
            if (d.data.create_instructor.success) {
                this.props.onSubmitSuccess?.()
            }
            else {
                alert('fail to create instructor.' + d.data.create_instructor.msg)
                this.props.onSubmitFail?.()

            }
        })
            .catch(e => {
                console.log(e)
                console.log(JSON.stringify(e))
                alert('error creating instructor')
                this.props.onSubmitFail?.()

            })
    }


    render() {
        return <div>
            <div className='row-gravity-center'>
                <h2>강사생성</h2>
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
                        <td>레벨</td>
                        <td><DropdownButton title={this.state.level == null ? 'select' : (() => {
                            // find level string of instructor level info which has id of this.state.level
                            for (let i = 0; i < this.state.instructor_level_info_arr.length; i++) {
                                if (this.state.instructor_level_info_arr[i].id === this.state.level) {
                                    return this.state.instructor_level_info_arr[i].level_string
                                }
                            }
                        })()}>
                            {this.state.instructor_level_info_arr === null ? <Dropdown.Item><CircularProgress /></Dropdown.Item> : this.state.instructor_level_info_arr.filter(x => x.active).sort((a, b) => {
                                return a.rank - b.rank
                            }).map(d => <Dropdown.Item onClick={e => this.setState({
                                level: d.id
                            })}>
                                {d.level_string}
                            </Dropdown.Item>)}

                        </DropdownButton></td>
                    </tr>
                    <tr>
                        <td>생년월일</td>
                        <td>

                            <KeyboardDatePicker
                                placeholder="19901127"
                                value={this.state.birthdate}
                                onChange={date => {
                                    this.setState({
                                        birthdate: date
                                    })
                                }}
                                format="yyyyMMdd"
                            />
                        </td>
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
                        <td>견습생 여부</td>
                        <td>
                            <ButtonGroup toggle>
                                {[['예', true], ['아니오', false]].map((d, i) => {

                                    return <ToggleButton
                                        key={i}
                                        type="radio"
                                        value={d[1]}
                                        checked={this.state.is_apprentice == d[1]}
                                        onChange={e => this.setState({
                                            is_apprentice: d[1]
                                        })}
                                    >
                                        {d[0]}
                                    </ToggleButton>
                                })}

                            </ButtonGroup>
                        </td>
                    </tr>
                    <tr>
                        <td>자격취득일</td>
                        <td>
                            {/* <Form.Control value={this.state.validation_date} onChange={e => {
                            this.setState({
                                validation_date: e.target.value
                            })
                        }} /> */}
                            <KeyboardDatePicker
                                placeholder="19901127"
                                value={this.state.validation_date}
                                onChange={date => {
                                    this.setState({
                                        validation_date: date
                                    })
                                }}
                                format="yyyyMMdd"
                            />
                        </td>
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
            <div className='row-gravity-center children-padding'>
                <Button onClick={e => this.props.onCancelClick?.()}>취소</Button>
                <Button onClick={e => this.submitcallback?.()}>생성</Button>
            </div>


        </div>
    }
}

export default CreateInstructorPage

