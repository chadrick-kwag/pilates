import React from 'react'
import ClientSearchComponent from '../components/ClientSearchComponent'
import InstructorSearchComponent from '../components/InstructorSearchComponent'
import { Button, Table } from 'react-bootstrap'

import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ko from 'date-fns/locale/ko';

import TimeKeeper from 'react-timekeeper';
import {gql} from '@apollo/client'

registerLocale('ko', ko)




const CREATE_LESSON_GQL = gql`mutation create_lesson($clientids:[Int!], $instructorid: Int!, $start_time: String!, $end_time: String!){

    create_lesson(clientids: $clientids, instructorid: $instructorid, start_time: $start_time, end_time: $end_time){
        success
    }
}`



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

    is_time_later(time1, time2){
        if(time1.hour > time2.hour){
            return true
        }

        else if(time1.hour < time2.hour){
            return false
        }

        if(time1.minute >= time2.minute){
            return true
        }

        if(time1.minute < time2.mintue){
            return false
        }

        

    }
    

    checkinput(){
        if(this.state.selected_client==null){
            return false
        }

        if(this.state.selected_instructor==null){
            return false
        }

        if(this.state.start_time==null || this.state.end_time==null){
            return false
        }

        if(this.state.selected_date==null){
            return false
        }


        if(!this.is_time_later(this.state.end_time, this.state.start_time)){
            return false
        }

        return true

        
    }

    createlesson() {

        let ret = this.checkinput()

        if(!ret){
            console.log('check input failed')
            return
        }

        let start_datetime = new Date(this.state.selected_date)
        start_datetime.setHours(this.state.start_time.hour)
        start_datetime.setMinutes(this.state.start_time.minute)
        start_datetime.setSeconds(0)
        start_datetime.setMilliseconds(0)
        // console.log(start_datetime.toUTCString())


        let end_datetime = new Date(this.state.selected_date)
        end_datetime.setHours(this.state.end_time.hour)
        end_datetime.setMinutes(this.state.end_time.minute)
        end_datetime.setSeconds(0)
        end_datetime.setMilliseconds(0)

        console.log(end_datetime.toUTCString())
        console.log(start_datetime.toUTCString())


        let vars = {
            clientids: [parseInt(this.state.selected_client.id)],
            instructorid: parseInt(this.state.selected_instructor.id),
            start_time: start_datetime.toUTCString(),
            end_time: end_datetime.toUTCString()
        }

        console.log(vars)

        this.props.apolloclient.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: vars
        }).then(d=>{
            console.log(d)
            if(d.data.create_lesson.success){
                console.log('success creating lesson')
                return
            }

            console.log('failed to create lesson')


            
        }).catch(e=>{
            console.log('error creating lesson')
            console.log(JSON.stringify(e))
        })
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

                <div style={{ display: "flex", flexDirection: "row" }}>
                    <span>시간선택</span>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <span>시작</span>
                        <TimeKeeper
                            hour24Mode="true"
                            coarseMinutes="15"
                            forceCoarseMinutes="true"
                            switchToMinuteOnHourSelect="true"
                            time={this.state.start_time == null ? "12:00" : this.state.start_time.formatted24}
                            onChange={(data) => {
                                console.log(data)
                                this.setState({
                                    start_time: data
                                })
                            }}
                        />

                    </div>


                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <span>종료</span>
                        <TimeKeeper
                            hour24Mode="true"
                            coarseMinutes="15"
                            forceCoarseMinutes="true"
                            switchToMinuteOnHourSelect="true"
                            time={this.state.end_time == null ? "12:00" : this.state.end_time.formatted24}
                            onChange={(data) => {
                                console.log(data)
                                this.setState({
                                    end_time: data
                                })
                            }}
                        />

                    </div>


                </div>

            </div>

            <div>
                <Button onClick={e=>this.props.cancel_callback()}>취소</Button>
                <Button onClick={e=>this.createlesson()}>create</Button>
            </div>
        </div>
    }
}

export default CreateLessonPage