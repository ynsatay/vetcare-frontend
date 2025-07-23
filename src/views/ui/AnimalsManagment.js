import Animalslist from "../list/Animallist.js"
import { Row, Col } from "reactstrap";

const Tables = () => {
  return (
    <Row>
      {/* --------------------------------------------------------------------------------*/}
      {/* table-1*/}
      {/* --------------------------------------------------------------------------------*/}
      <Col lg="12">
        <Animalslist />
      </Col>
    </Row>
  );
};

export default Tables;
