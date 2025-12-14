import {
  Card,
  CardBody,
  CardImg,
  CardSubtitle,
  CardText,
  CardTitle,
  Button,
} from "reactstrap";
import { useLanguage } from "../../context/LanguageContext.js";

const Blog = (props) => {
  const { t } = useLanguage();
  return (
    <Card>
      <CardImg alt="Card image cap" src={props.image} />
      <CardBody className="p-4">
        <CardTitle tag="h5">{props.title}</CardTitle>
        <CardSubtitle>{props.subtitle}</CardSubtitle>
        <CardText className="mt-3">{props.text}</CardText>
        <Button color={props.color}>{t('ReadMore')}</Button>
      </CardBody>
    </Card>
  );
};

export default Blog;
