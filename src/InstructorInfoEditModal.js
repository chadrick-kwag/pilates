import React from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import {UPDATE_INSTRUCTOR_INFO_GQL} from './common/gql_defs'


class InstructorInfoEditModal extends React.Component {


    constructor(props){
        super(props)

        this.state={
            name: this.props.instructor.name,
            phonenumber: this.props.instructor.phonenumber
        }

        this.is_identical_to_inital = this.is_identical_to_inital.bind(this)
        this.submit = this.submit.bind(this)
        this.check_inputs= this.check_inputs.bind(this)
    }


    is_identical_to_inital(){
        if( (this.props.instructor.name== this.state.name) && (this.props.instructor.phonenumber == this.state.phonenumber)){
            // no need to update since no changes are made
            return true
        }

        return false
    }

    check_inputs(){
        // check validity of inputs

        if(this.state.name.trim()==""){
            return false
        }

        if(this.state.phonenumber.trim()==""){
            return false
        }

        return true
    }


    submit(){
        if(this.is_identical_to_inital()){
            // assume changes are done
            this.props.onSubmitSuccess()
            return
        }

        if(this.check_inputs()){
            // if inputs are okay, then proceed with submit
            this.props.apolloclient.mutate({
                mutation: UPDATE_INSTRUCTOR_INFO_GQL,
                variables: {
                    id: parseInt(this.props.instructor.id),
                    name: this.state.name,
                    phonenumber: this.state.phonenumber
                }
                
            }).then(d=>{
                console.log(d)

                if(d.data.update_instructor.success){
                    this.props.onSubmitSuccess()
                }
                else{
                    this.props.onSubmitFail()
                }
            }).catch(e=>{
                console.log(e)
                console.log(JSON.stringify(e))

                this.props.onSubmitFail()
            })
        }
        else{
            alert('invalid inputs')
        }
    }

    render() {
        return <Modal show={true}>
            <Modal.Body>
                <div>
                    <div>
                    <span>이름: </span> <Form.Control value={this.state.name} onChange={e=>this.setState({
                        name: e.target.value
                    })}></Form.Control>
                    </div>

                    <div>
                        <span>연락처:</span>
                        <Form.Control value={this.state.phonenumber} onChange={e=>this.setState({
                            phonenumber: e.target.value
                        })} ></Form.Control>
                    </div>
                    
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div>
                    <Button onClick={e=>this.props.onCancelClick()}>cancel</Button>
                    <Button onClick={e=>this.submit()}>submit</Button>
                </div>
            </Modal.Footer>
        </Modal>
    }
}


InstructorInfoEditModal.defaultProps = {
    onSubmitFail: ()=>{
        alert('submit failed')
    }

}

export default InstructorInfoEditModal