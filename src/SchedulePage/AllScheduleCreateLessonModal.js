import { Button, Modal, DropdownButton, Dropdown } from 'react-bootstrap'
import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import InstructorSearchComponent2 from '../components/InstructorSearchComponent2'

import React from 'react'
import moment from 'moment'

import {

    CREATE_LESSON_GQL, QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID

} from '../common/gql_defs'

class AllScheduleCreateLessonModal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            create_selected_client: null,
            create_selected_instructor: null,
            subscriptions: null,
            selected_subscription: null
        }

        this.create_input_check = this.create_input_check.bind(this)
        this.create_lesson = this.create_lesson.bind(this)
        this.fetch_subscriptions_for_selected_client = this.fetch_subscriptions_for_selected_client.bind(this)
    }


    create_input_check() {
        if (this.state.create_selected_client == null) {
            return false
        }

        if (this.state.create_selected_instructor == null) {
            return false
        }

        if(this.state.selected_subscription==null){
            return false
        }

        return true
    }


    fetch_subscriptions_for_selected_client() {

        let clientid = parseInt(this.state.create_selected_client.id)
        console.log(clientid)

        this.props.apolloclient.query({
            query: QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
            variables: {
                clientid: clientid
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            if (d.data.query_subscriptions_with_remainrounds_for_clientid.success) {
                this.setState({
                    subscriptions: d.data.query_subscriptions_with_remainrounds_for_clientid.subscriptions
                })
            }
            else {
                alert('failed to fetch subscriptions')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert("error fetching subscriptions")
        })
    }

    create_lesson() {
        let check_res = this.create_input_check()
        if (!check_res) {
            alert("inputs not valid")
            return
        }


        let starttime = this.props.start.toDate().toUTCString()
        let endtime = this.props.end.toDate().toUTCString()

        let _variables = {
            clientids: [parseInt(this.state.create_selected_client.id)],
            instructorid: parseInt(this.state.create_selected_instructor.id),
            starttime: starttime,
            endtime: endtime
        }


        this.props.apolloclient.mutate({
            mutation: CREATE_LESSON_GQL,
            variables: _variables
        }).then(d => {
            console.log(d)
            if (d.data.create_lesson.success) {

                this.props.onCreateSuccess()
                // cb()
                // this.fetchdata()
            }
            else {
                console.log('failed to create lesson')
                alert('failed to create lesson')
            }

        }).catch(e => {
            console.log('error creating lesson')
            console.log(JSON.stringify(e))
            alert('failed to create lesson')
        })

    }

    get_subscription_repr(ssobj) {
        console.log(ssobj)
        let created_time = moment(new Date(parseInt(ssobj.subscription.created))).format("YY/MM/DD")
        return created_time + " 남은횟수: " + ssobj.remainrounds + "/" + ssobj.subscription.rounds
    }



    render() {

        let datetimestr
        let date = this.props.start.toDate()
        let moment_date = moment(date)

        let end_date = this.props.end.toDate()
        let end_moment = moment(end_date)


        datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
        let endstr = end_moment.format("hh:mm A")

        datetimestr = datetimestr + endstr


        let subscriptions_div = null

        if (this.state.subscriptions != null) {

            let variant = this.state.selected_subscription==null ? "Danger" : "Primary"

            subscriptions_div = <div style={{paddingTop: "10px"}}><DropdownButton variant={variant} style={{
                width: "300px"
            }} title={this.state.selected_subscription == null ? "please select" : this.get_subscription_repr(this.state.selected_subscription)}>

                    {this.state.subscriptions.map((d, i) =>
                        <Dropdown.Item as="button" key={i} onClick={e=>
                            this.setState({
                                selected_subscription: d
                            })
                        } >{this.get_subscription_repr(d)}</Dropdown.Item>
                    )}

                </DropdownButton></div>
        }


        return <Modal show={true} onHide={() => this.props.onCancel()}>
            <Modal.Body>
                <ClientSearchComponent2 apolloclient={this.props.apolloclient} clientSelectedCallback={d => this.setState({
                    create_selected_client: d
                }, () => {
                    this.fetch_subscriptions_for_selected_client()
                })

                } />

                {subscriptions_div}

                <hr></hr>

                <InstructorSearchComponent2 apolloclient={this.props.apolloclient} instructorSelectedCallback={d => this.setState({
                    create_selected_instructor: d
                })} />

                <hr></hr>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>수업날짜: </span>
                    {datetimestr}
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e => {
                    this.props.onCancel()
                }}>
                    close
                </Button>
                <Button onClick={e => {
                    this.create_lesson()
                }}>OK</Button>
            </Modal.Footer>

        </Modal>

    }
}

export default AllScheduleCreateLessonModal