import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { gql } from '@apollo/client'

const CREATE_CLIENT_GQL = gql`mutation  CreateClient($name: String!, $phonenumber: String!){
    createclient(name: $name, phonenumber: $phonenumber){
        id
        name
        phonenumber
    }
}`


class CreateClientPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name: "",
            phonenumber: ""
        }

        this.submitcallback = this.submitcallback.bind(this)
    }


    submitcallback() {

        this.props.apolloclient.mutate({
            mutation: CREATE_CLIENT_GQL,
            variables: {
                name: this.state.name,
                phonenumber: this.state.phonenumber
            }
        }).then(d => {
            console.log(d)
            if(d.data!=null){
                this.props.onSubmitSuccess()
            }
            else{
                this.props.onSubmitFail()
            }
            // this.props.changeViewMode('list_client')
        })
            .catch(e => {
                console.log(e)
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
                <span>name</span> <Form.Control value={this.state.name} onChange={e => this.setState({ name: e.target.value })}></Form.Control>

            </div>
            <div>
                <span>phone</span> <Form.Control value={this.state.phonenumber} onChange={e => this.setState({ phonenumber: e.target.value })}></Form.Control>
            </div>
            <div>
                <Button onClick={e=> this.props.cancelBtnCallback()}>cancel</Button>
                <Button onClick={e => this.submitcallback()}>submit</Button>
            </div>
        </div>
    }
}

export default CreateClientPage