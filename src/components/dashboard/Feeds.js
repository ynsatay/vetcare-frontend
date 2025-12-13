import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import tr from "dayjs/locale/tr";
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
import "../../views/ui/IdentityInfo.css";

// dayjs setup
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(tr);
dayjs.tz.setDefault("Europe/Istanbul");

// 🔹 TEK NOKTADAN TARİH FORMATLAMA
const formatDate = (date) =>
  date
    ? dayjs.tz(date, "Europe/Istanbul").format("DD.MM.YYYY HH:mm")
    : "";

const Feeds = ({ activeTab: controlledTab, onTabChange, onData }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localTab, setLocalTab] = useState("payments");
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const activeTab = controlledTab ?? localTab;

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/feeds?category=${activeTab}`)
      .then((res) => {
        setFeeds(res.data);
        onData?.(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const kpi = useMemo(() => {
    const total = feeds.length;
    const last = feeds[0];
    const users = new Set(feeds.map((f) => f.user_name)).size;

    return {
      total,
      lastTitle: last?.title ?? "",
      lastTime: formatDate(last?.created_at),
      users,
    };
  }, [feeds]);

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

        {/* Tabs */}
        <div className="identity-tabs" style={{ margin: "8px 0" }}>
          {[
            ["payments", "Tahsilat"],
            ["vaccine", "Aşı"],
            ["stock", "Stok"],
            ["service", "Hizmet"],
            ["appointment", "Randevu"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`identity-tab ${activeTab === key ? "active" : ""}`}
              onClick={() =>
                onTabChange ? onTabChange(key) : setLocalTab(key)
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* KPI */}
        <div className="identity-owner-actions" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="identity-chip info">Toplam: {kpi.total}</span>
          <span className="identity-chip success">Kullanıcı: {kpi.users}</span>
          {kpi.lastTitle && <span className="identity-chip">Son: {kpi.lastTitle}</span>}
          {kpi.lastTime && (
            <span className="identity-chip warning">Zaman: {kpi.lastTime}</span>
          )}
        </div>

        {/* Search + Export */}
        <div className="identity-input-group" style={{ marginBottom: 10 }}>
          <input
            className="identity-owner-input"
            placeholder="Akışlarda ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="identity-btn identity-btn-xs"
            style={{ marginLeft: 8 }}
            onClick={() => {
              const header = ["Kullanıcı", "Başlık", "İkon", "Renk", "Tarih"];
              const rows = feeds.map((f) => [
                f.user_name,
                f.title,
                f.icon,
                f.color,
                formatDate(f.created_at),
              ]);
              const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `feeds-${activeTab}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Dışa Aktar
          </button>
        </div>

        {/* List */}
        <ListGroup
          flush
          style={{
            height: isMobile ? 300 : 380,
            overflowY: "auto",
          }}
        >
          {feeds.length === 0 ? (
            <ListGroupItem className="text-center">Akış yok</ListGroupItem>
          ) : (
            feeds
              .filter((f) => {
                const s = search.toLowerCase().trim();
                return (
                  !s ||
                  f.title?.toLowerCase().includes(s) ||
                  f.user_name?.toLowerCase().includes(s)
                );
              })
              .map((feed, index) => (
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
                      <i className={feed.icon || "bi bi-info-circle"} />
                    </Button>
                    <div>
                      <strong>{feed.user_name}</strong> — {feed.title}
                    </div>
                  </div>
                  <small className="text-muted" style={{ whiteSpace: "nowrap" }}>
                    {formatDate(feed.created_at)}
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
