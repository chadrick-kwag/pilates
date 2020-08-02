import React from 'react'
import ClientSearchComponent from '../components/ClientSearchComponent'
import InstructorSearchComponent from '../components/InstructorSearchComponent'
import { Button, Table } from 'react-bootstrap'

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ko from 'date-fns/locale/ko';

import TimeKeeper from 'react-timekeeper';

registerLocale('ko', ko)

class CreateLessonPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            selected_client: null,
            selected_instructor: null,
            selected_date: new Date(),
            start_time: null,
            end_time: null

        }

        this.createlesson = this.createlesson.bind(this)
    }

    createlesson() {
        console.log('attempt to create lesson')
    }

    render() {

        return <div>
            create lesson

            <div>
                <h2>회원선택</h2>
                <h3>회원검색</h3>
                <ClientSearchComponent apolloclient={this.props.apolloclient} clientSelectedCallback={c => this.setState({
                    selected_client: c
                })} />

                <h3>선택된 회원</h3>
                {this.state.selected_client == null ? <div>없음</div> : <Table>
                    <tr>
                        <td>id</td>
                        <td>{this.state.selected_client.id}</td>
                    </tr>
                    <tr>
                        <td>name</td>
                        <td>{this.state.selected_client.name}</td>
                    </tr>
                    <tr>
                        <td>phone</td>
                        <td>{this.state.selected_client.phonenumber}</td>
                    </tr>
                </Table>}


            </div>

            <div>
                <h2>강사선택</h2>
                <h4>강사검색</h4>
                <InstructorSearchComponent apolloclient={this.props.apolloclient} instructorSelectedCallback={i => {
                    console.log(i)
                    this.setState({
                        selected_instructor: i
                    })
                }} />
                <h4>선택된 강사</h4>
                {this.state.selected_instructor == null ? <div>없음</div> : <Table>
                    <tr>
                        <td>id</td>
                        <td>{this.state.selected_instructor.id}</td>
                    </tr>
                    <tr>
                        <td>name</td>
                        <td>{this.state.selected_instructor.name}</td>
                    </tr>
                    <tr>
                        <td>phone</td>
                        <td>{this.state.selected_instructor.phonenumber}</td>
                    </tr>
                </Table>}
            </div>

            <div>
                <h2>시간선택</h2>
                <span>날짜선택</span>
                <DatePicker
                    locale="ko"
                    selected={this.state.selected_date}
                    onChange={e => this.setState({
                        selected_date: e
                    })}
                    dateFormat="yyMMdd"

                />

                <div>
                    <span>시간선택</span>
                    <div>
                        <span>시작</span>
                        <TimeKeeper
                            hour24Mode="true"
                            switchToMinuteOnHourSelect="true"
                            time={this.state.start_time == null ? "12:00" : this.state.start_time}
                            onChange={(data) => {
                                console.log(data)
                                this.setState({
                                    start_time: data.formatted24
                                })
                            }}
                        />

                    </div>
                </div>

            </div>

            <div>
                <Button>create</Button>
            </div>
        </div>
    }
}

export default CreateLessonPage