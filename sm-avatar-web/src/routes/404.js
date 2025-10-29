import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';

function NotFound() {
  return (
    <div className="landing-wrapper">
      <Header />
      <div className="container d-flex">
        <div className="landing-container flex-grow-1">
          <div className="col-12 col-lg-6">
            <div className="row" style={{ marginBottom: '9px' }}>
              <div>
                <h1 className="fw-bol">404</h1>
              </div>
            </div>
            <div className="row">
              <div>
                <h4 className="fw-light" style={{ marginBottom: '31px' }}>
                  Page not found.
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default styled(NotFound)`
    .landing-wrapper {
        min-height: 100vh;
        background-color: #f5f5f5;
    }
    
    .landing-container {
        margin-top: 100px;
    }
    
    .landing-container h1 {
        font-size: 5rem;
        line-height: 1.2;
        color: #000;
    }
    
    .landing-container h4 {
        font-size: 1.5rem;
        line-height: 1.2;
        color: #000;
    }
    `;
