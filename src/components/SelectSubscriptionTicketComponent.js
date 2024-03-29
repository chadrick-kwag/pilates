import React from 'react'
import { QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID } from '../common/gql_defs'

import { Spinner, Table, Button } from 'react-bootstrap'
import moment from 'moment'

class SelectSubscriptionTikcetComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            subscription_ticket: this.props.subscription_ticket,
            selected_subscription_remain_info: null,
            search_results: null,
            force_view_results: false
        }

        this.fetchdata = this.fetchdata.bind(this)
    }


    componentDidUpdate(prevprops) {

        // check for reset conditions

        let need_reset = false

        if(prevprops.clientid!=this.props.clientid || prevprops.activity_type != this.props.activity_type || prevprops.grouping_type != this.props.grouping_type){
            need_reset = true
        }

        if (need_reset) {
            console.log('manually calling fetchdata')

            // reset states
            this.setState({
                subscription_ticket: null,
                selected_subscription_remain_info: null,
                search_results: null,
                force_view_results: false

            }, ()=>{
                this.props.onSubscriptionTicketSelected(null)
                this.fetchdata()})
            // this.fetchdata()
        }
    }

    componentDidMount() {
        this.fetchdata()
    }

    fetchdata() {

        console.log('fetching data for client: ' + this.props.clientid)

        this.props.apolloclient.query({
            query: QUERY_SUBSCRIPTIONS_WITH_REMAINROUNDS_FOR_CLIENTID,
            variables: {
                clientid: parseInt(this.props.clientid),
                activity_type: this.props.activity_type,
                grouping_type: this.props.grouping_type
            },
            fetchPolicy: 'no-cache'
        }).then(d => {

            console.log(d)

            if (d.data.query_subscriptions_with_remainrounds_for_clientid.success) {
                this.setState({
                    search_results: d.data.query_subscriptions_with_remainrounds_for_clientid.subscriptions
                })
            }
            else {
                alert('failed to fetch data')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('error fetching data')
        })
    }


    render() {


        if (this.state.selected_subscription_remain_info != null && this.state.force_view_results == false) {
            console.log(this.state.selected_subscription_remain_info)
            return <div>
                {this.state.selected_subscription_remain_info == null ? null : <Button onClick={e => this.setState({
                    force_view_results: true
                })}>플랜찾기</Button>}
                <div className='col-gravity-center'>

                    <span className='bold'>선택 플랜</span>
                    <span>created: {moment(new Date(parseInt(this.state.selected_subscription_remain_info.created))).format('YYYY-MM-DD HH:mm')}</span>
                    <span>remain count: {this.state.selected_subscription_remain_info.remain_count}</span>

                </div>
            </div>
        }


        if (this.state.search_results == null) {
            return <div>
                <Spinner animation='border' />
            </div>
        }
        else if (this.state.search_results.length == 0) {
            return <div>
                <span>등록된 플랜 없음</span>
            </div>
        }
        else {

            // need to calculate valid tickets per subscription id

            let subscription_remain_info = []

            this.state.search_results.map(d => {
                console.log(d)
                let ss_created = d.subscription.created

                let remain_count = d.tickets.length
                let tickets = d.tickets

                if(tickets.length==0){
                    return
                }

                subscription_remain_info.push({
                    created: ss_created,
                    remain_count: remain_count,
                    tickets: tickets
                })

            })


            return <div className='col-gravity-center'>
                {this.state.selected_subscription_remain_info == null ? null : <Button onClick={e => this.setState({
                    force_view_results: false
                })}>이전으로</Button>}
                <span className='bold'>플랜 선택해주세요</span>
                <Table className='row-clickable-table'>
                    <thead>
                        <th>created</th>
                        <th>remaining</th>
                    </thead>
                    <tbody>
                        {subscription_remain_info.map(d => {
                            return <tr onClick={e => this.setState({
                                selected_subscription_remain_info: d,
                                force_view_results: false
                            }, ()=>{
                                this.props.onSubscriptionTicketSelected(d.tickets[0])
                            })}>
                                <td>
                                    {moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}
                                </td>
                                <td>
                                    {d.remain_count}
                                </td>
                            </tr>
                        })}

                    </tbody>
                </Table>
            </div>
        }
        return <div>

        </div>
    }
}


SelectSubscriptionTikcetComponent.defaultProps = {
    subscription_ticket: null
}

export default SelectSubscriptionTikcetComponent