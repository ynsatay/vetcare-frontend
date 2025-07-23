import React from 'react'
import "../scss/_personeldef.scss";
import { Col, Row } from 'reactstrap';
import PersonalList from '../list/PersonalList.js'

function PersonelManagment() {
  return (
    <Row>
      {/* --------------------------------------------------------------------------------*/}
      {/* table-1*/}
      {/* --------------------------------------------------------------------------------*/}
      <Col lg="12">
        <PersonalList/>
      </Col>
    </Row>

  )
}

export default PersonelManagment