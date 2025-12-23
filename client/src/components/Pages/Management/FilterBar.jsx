import React, { useMemo } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";

const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

const FilterBar = ({
  logs,
  pages,

  selectedPage,
  setSelectedPage,
  dateRange,
  setDateRange,

  deviceFilter,
  setDeviceFilter,
  browserFilter,
  setBrowserFilter,
  osFilter,
  setOsFilter,
  countryFilter,
  setCountryFilter,

  segmentFilter,
  setSegmentFilter,
  trafficSourceFilter,
  setTrafficSourceFilter,

  utmSourceFilter,
  setUtmSourceFilter,
  utmMediumFilter,
  setUtmMediumFilter,
  utmCampaignFilter,
  setUtmCampaignFilter,

  visitorTypeFilter,
  setVisitorTypeFilter,

  qualifiedOnly,
  setQualifiedOnly,
  excludeBots,
  setExcludeBots,

  minEngagement,
  setMinEngagement,
  scrollMin,
  setScrollMin,
  scrollMax,
  setScrollMax,
}) => {
  const options = useMemo(() => {
    const devices = uniq(logs.map((l) => l.deviceType));
    const browsers = uniq(logs.map((l) => l.browser));
    const os = uniq(logs.map((l) => l.os));
    const countries = uniq(logs.map((l) => l.geo?.country));
    const segments = uniq(logs.map((l) => l.segment));
    const trafficSources = uniq(logs.map((l) => l.trafficSource || "unknown"));

    const utmSources = uniq(logs.map((l) => l.utm?.source));
    const utmMediums = uniq(logs.map((l) => l.utm?.medium));
    const utmCampaigns = uniq(logs.map((l) => l.utm?.campaign));

    return {
      devices,
      browsers,
      os,
      countries,
      segments,
      trafficSources,
      utmSources,
      utmMediums,
      utmCampaigns,
    };
  }, [logs]);

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Filters</Card.Title>

        <Row className="g-3">
          <Col lg={3} md={6}>
            <Form.Label>Page</Form.Label>
            <Form.Select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
              <option value="">All pages</option>
              {(pages || []).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={3}>
            <Form.Label>Start date</Form.Label>
            <Form.Control
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            />
          </Col>

          <Col lg={3} md={3}>
            <Form.Label>End date</Form.Label>
            <Form.Control
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            />
          </Col>

          <Col lg={3} md={6} className="d-flex align-items-end">
            <div className="w-100">
              <Form.Check
                type="switch"
                id="excludeBots"
                label="Exclude bots"
                checked={excludeBots}
                onChange={(e) => setExcludeBots(e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="qualifiedOnly"
                label="Qualified only"
                checked={qualifiedOnly}
                onChange={(e) => setQualifiedOnly(e.target.checked)}
              />
            </div>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Visitor type</Form.Label>
            <Form.Select value={visitorTypeFilter} onChange={(e) => setVisitorTypeFilter(e.target.value)}>
              <option value="">All</option>
              <option value="new">New visitors</option>
              <option value="returning">Returning visitors</option>
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Device</Form.Label>
            <Form.Select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)}>
              <option value="">All</option>
              {options.devices.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Browser</Form.Label>
            <Form.Select value={browserFilter} onChange={(e) => setBrowserFilter(e.target.value)}>
              <option value="">All</option>
              {options.browsers.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>OS</Form.Label>
            <Form.Select value={osFilter} onChange={(e) => setOsFilter(e.target.value)}>
              <option value="">All</option>
              {options.os.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Country</Form.Label>
            <Form.Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">All</option>
              {options.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Segment</Form.Label>
            <Form.Select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
              <option value="">All</option>
              {options.segments.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Traffic source</Form.Label>
            <Form.Select value={trafficSourceFilter} onChange={(e) => setTrafficSourceFilter(e.target.value)}>
              <option value="">All</option>
              {options.trafficSources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>UTM source</Form.Label>
            <Form.Select value={utmSourceFilter} onChange={(e) => setUtmSourceFilter(e.target.value)}>
              <option value="">All</option>
              {options.utmSources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>UTM medium</Form.Label>
            <Form.Select value={utmMediumFilter} onChange={(e) => setUtmMediumFilter(e.target.value)}>
              <option value="">All</option>
              {options.utmMediums.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>UTM campaign</Form.Label>
            <Form.Select value={utmCampaignFilter} onChange={(e) => setUtmCampaignFilter(e.target.value)}>
              <option value="">All</option>
              {options.utmCampaigns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Min engagement score</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={minEngagement}
              onChange={(e) => setMinEngagement(e.target.value)}
              placeholder="e.g. 50"
            />
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Scroll depth min %</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              step="1"
              value={scrollMin}
              onChange={(e) => setScrollMin(e.target.value)}
              placeholder="0"
            />
          </Col>

          <Col lg={3} md={6}>
            <Form.Label>Scroll depth max %</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              step="1"
              value={scrollMax}
              onChange={(e) => setScrollMax(e.target.value)}
              placeholder="100"
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FilterBar;