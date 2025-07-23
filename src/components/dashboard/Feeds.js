import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.ts";
import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  CardSubtitle,
  ListGroupItem,
  Button,
} from "reactstrap";

const Feeds = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/feeds")  // Backend api adresin
      .then((res) => {
        setFeeds(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feeds yüklenirken hata:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <CardTitle tag="h5">Akışlar</CardTitle>
          <CardSubtitle className="mb-2 text-muted" tag="h6">
            Yükleniyor...
          </CardSubtitle>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Akışlar</CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          Akış Listesi
        </CardSubtitle>
        <ListGroup
          flush
          className="mt-4"
          style={{
            height: "380px",
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >
          {feeds.length === 0 ? (
            <ListGroupItem className="text-center">Akış yok</ListGroupItem>
          ) : (
            feeds.map((feed, index) => (
              <ListGroupItem
                key={index}
                className="d-flex justify-content-between align-items-center p-3 border-0"
              >
                <div className="d-flex align-items-center">
                  <Button
                    className="rounded-circle me-3"
                    size="sm"
                    color={feed.color || "primary"}
                  >
                    <i className={feed.icon || "bi bi-info-circle"}></i>
                  </Button>
                  <div>
                    <strong>{feed.user_name}</strong> — {feed.title}
                  </div>
                </div>
                <small className="text-muted text-small" style={{ whiteSpace: "nowrap" }}>
                  {new Date(feed.created_at).toLocaleString()}
                </small>
              </ListGroupItem>
            ))
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default Feeds;
