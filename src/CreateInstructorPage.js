import React from 'react'
import {Form, Button} from 'react-bootstrap'
import {gql} from '@apollo/client'

const CREATE_INSTRUCTOR_GQL = gql`mutation createinstructor($name: String!, $phonenumber: String!){
    createinstructor(name: $name, phonenumber: $phonenumber){
        success
    }
}
`

class CreateInstructorPage extends React.Component{


    constructor(props){
        super(props)

        this.state={
            name: "",
            phonenumber: ""
        }

        this.createcallback = this.createcallback.bind(this)
    }

    createcallback(){
        this.props.apolloclient.mutate({
            mutation: CREATE_INSTRUCTOR_GQL,
            variables:{
                name: this.state.name,
                phonenumber: this.state.phonenumber
            }
        }).then(d=>{
            console.log(d)
            if(d.data.createinstructor.success){
                console.log("create success")
                this.props.success_callback()
                return
            }

            console.log("create failed")
            alert('instructor create failed')
        })
        .catch(e=>{
            console.log(e)
            alert('error attempt instructor creation')
        })
    }

    render(){
        return <div>

            <div>
                <span>name</span>
                <Form.Control value={this.state.name}  onChange={e=>this.setState({name: e.target.value})}/>
            </div>

            <div>
                <span>phone</span>
                <Form.Control value={this.state.phonenumber}  onChange={e=>this.setState({phonenumber: e.target.value})}/>
            </div>

            <div>
                <Button onClick={e=>this.createcallback()}>create</Button>
            </div>

        </div>
    }
}

export default CreateInstructorPage