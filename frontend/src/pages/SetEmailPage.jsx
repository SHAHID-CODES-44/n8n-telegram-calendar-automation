import React from 'react'
import { Link } from 'react-router-dom';
import "./SetEmailPage.css";

const SetEmailPage = () => {
    return (
        <>
        <div className="main-container">
            <div className="middle-box">
                <h1 className='middle-section-title'>Set Up Your Email</h1>
                <p>Add Email</p>
                <input type="text" className="email-inp" placeholder='Add you Email' required/>
                <br />
                <Link to="/ChatPage"><button className="confir-btn">Confirm & Proceed</button></Link>
            </div>
        </div>
        </>
    )
}

export default SetEmailPage
