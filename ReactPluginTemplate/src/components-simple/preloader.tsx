import React, { Component } from "react";
import Spinner from 'react-bootstrap/Spinner';

class Spinner20px extends Component {
    render() {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>);
    }
}

export default Spinner20px;