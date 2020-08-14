import React from 'react'
import { from } from '@apollo/client'
import { Button, Form } from 'react-bootstrap'


class CheckCouponComponent extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            coupon_serial: ""
        }
    }

    
    

    render() {


        return <div className="row-gravity-center">
            <span className={(() => {
                let classlist = 'block-header '
                if (this.props.disabled) {
                    classlist += 'disabled '
                }

                return classlist
            })()} >쿠폰등록</span>
            <Form.Control disabled={this.props.disabled}  value={this.state.coupon_serial} onChange={e => this.setState({
                coupon_serial: e.target.value
            })} />
            <Button disabled={this.props.disabled}>등록</Button>
        </div>

    }
}

CheckCouponComponent.defaultProps ={
    disabled: false
}

export default CheckCouponComponent