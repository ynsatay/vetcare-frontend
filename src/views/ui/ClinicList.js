import ClinicList from "../list/ClinicList";
import { Row, Col } from "reactstrap";

const Tables = () => {
  return (
    <Row>
      {/* --------------------------------------------------------------------------------*/}
      {/* table-1*/}
      {/* --------------------------------------------------------------------------------*/}
      <Col lg="12">
        <ClinicList />
      </Col>
    </Row>
  );
};

export default Tables;
