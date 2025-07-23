import OfficeList from "../list/OfficeList";
import { Row, Col } from "reactstrap";

const Tables = () => {
  return (
    <Row>
      {/* --------------------------------------------------------------------------------*/}
      {/* table-1*/}
      {/* --------------------------------------------------------------------------------*/}
      <Col lg="12">
        <OfficeList />
      </Col>
    </Row>
  );
};

export default Tables;
