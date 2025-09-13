import React, { useEffect, useState } from 'react';
import ExportCSV from './ExportCSV.jsx';
import FilterBar from './FilterBar.jsx';
import LogChart from './LogChart.jsx';
import LogTable from './LogTable.jsx';
import CustomPagination from './CustomPagination.jsx';
import ReportDownloadButton from './ReportDownloadButton.jsx';
import CustomerStatsCard from './CustomerStatsCard';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaUsers, FaGlobe, FaMobile, FaDesktop, FaTablet, FaUserClock } from 'react-icons/fa';

const LogDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(null);


    // New filter states
    const [deviceFilter, setDeviceFilter] = useState('');
    const [browserFilter, setBrowserFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [visitorTypeFilter, setVisitorTypeFilter] = useState('');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        newVisitors: 0,
        returningVisitors: 0,
        devices: { desktop: 0, mobile: 0, tablet: 0, unknown: 0 },
        topCountries: [],
        topReferrers: []
    });

    const logsPerPage = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/visitors/logs', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch logs');
                }

                const data = await response.json();
                setLogs(data);
                setFilteredLogs(data);

                const uniquePages = [...new Set(data.map(log => log.page))];
                setPages(uniquePages);

                // Default to last 7 days
                const now = new Date();
                const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
                setDateRange({
                    start: lastWeek.toISOString().split('T')[0],
                    end: now.toISOString().split('T')[0],
                });
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchWeeklyReport = async () => {
            try {
                const res = await fetch('/api/visitors/weekly-report');
                if (!res.ok) throw new Error('Failed to fetch weekly report');
                const report = await res.json();
                setWeeklyReport(report);
            } catch (err) {
                console.error('Error fetching weekly report:', err);
            }
        };

        fetchLogs();
        fetchWeeklyReport();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...logs];

        if (selectedPage) {
            filtered = filtered.filter(log => log.page === selectedPage);
        }

        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(log => {
                const visit = new Date(log.visitDate);
                return visit >= start && visit <= end;
            });
        }

        if (deviceFilter) {
            filtered = filtered.filter(log => log.deviceType === deviceFilter);
        }

        if (browserFilter) {
            filtered = filtered.filter(log => log.browser === browserFilter);
        }

        if (countryFilter) {
            filtered = filtered.filter(log => log.geo?.country === countryFilter);
        }

        if (visitorTypeFilter === 'new') {
            filtered = filtered.filter(log => !log.isReturningVisitor);
        } else if (visitorTypeFilter === 'returning') {
            filtered = filtered.filter(log => log.isReturningVisitor);
        }

        setFilteredLogs(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [selectedPage, dateRange, deviceFilter, browserFilter, countryFilter, visitorTypeFilter, logs]);

    // Calculate statistics from filtered logs
    useEffect(() => {
        if (filteredLogs.length > 0) {
            // Count device types
            const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
            filteredLogs.forEach(log => {
                const device = log.deviceType?.toLowerCase() || 'unknown';
                deviceCounts[device] = (deviceCounts[device] || 0) + 1;
            });

            // Count visitor types
            const newVisitors = filteredLogs.filter(log => !log.isReturningVisitor).length;
            const returningVisitors = filteredLogs.filter(log => log.isReturningVisitor).length;

            // Count countries
            const countryCount = {};
            filteredLogs.forEach(log => {
                if (log.geo?.country) {
                    countryCount[log.geo.country] = (countryCount[log.geo.country] || 0) + 1;
                }
            });

            // Get top 5 countries
            const topCountries = Object.entries(countryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([country, count]) => ({ country, count }));

            // Count referrers
            const referrerCount = {};
            filteredLogs.forEach(log => {
                if (log.referrer) {
                    try {
                        const hostname = new URL(log.referrer).hostname;
                        referrerCount[hostname] = (referrerCount[hostname] || 0) + 1;
                    } catch (e) {
                        // Skip invalid URLs
                    }
                }
            });

            // Get top 5 referrers
            const topReferrers = Object.entries(referrerCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([referrer, count]) => ({ referrer, count }));

            setStats({
                total: filteredLogs.length,
                newVisitors,
                returningVisitors,
                devices: deviceCounts,
                topCountries,
                topReferrers
            });
        } else {
            setStats({
                total: 0,
                newVisitors: 0,
                returningVisitors: 0,
                devices: { desktop: 0, mobile: 0, tablet: 0, unknown: 0 },
                topCountries: [],
                topReferrers: []
            });
        }
    }, [filteredLogs]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * logsPerPage,
        currentPage * logsPerPage
    );

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Visitor Logs Dashboard</h2>
                <div>
                    <ExportCSV logs={filteredLogs} className="me-2" />
                    <ReportDownloadButton />
                </div>
                {weeklyReport && (
                    <Row className="mb-4">
                        <Col md={6} lg={4} className="mb-3">
                            <Card>
                                <Card.Body className="text-center">
                                    <FaUsers className="mb-2 text-primary" size={24} />
                                    <Card.Title>Weekly Sessions</Card.Title>
                                    <h3>{weeklyReport.totalSessions}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={4} className="mb-3">
                            <Card>
                                <Card.Body className="text-center">
                                    <FaUserClock className="mb-2 text-success" size={24} />
                                    <Card.Title>Unique Visitors</Card.Title>
                                    <h3>{weeklyReport.uniqueVisitors}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={4} className="mb-3">
                            <Card>
                                <Card.Body className="text-center">
                                    <FaGlobe className="mb-2 text-danger" size={24} />
                                    <Card.Title>Top Country</Card.Title>
                                    {weeklyReport.topCountries?.[0] ? (
                                        <>
                                            <h4>{weeklyReport.topCountries[0]._id}</h4>
                                            <div className="small text-muted">
                                                {weeklyReport.topCountries[0].visitors} visits
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-muted">No data</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

            </div>

            <FilterBar
                logs={logs}
                pages={pages}
                selectedPage={selectedPage}
                onPageChange={setSelectedPage}
                dateRange={dateRange}
                onDateChange={setDateRange}
                deviceFilter={deviceFilter}
                setDeviceFilter={setDeviceFilter}
                browserFilter={browserFilter}
                setBrowserFilter={setBrowserFilter}
                countryFilter={countryFilter}
                setCountryFilter={setCountryFilter}
                visitorTypeFilter={visitorTypeFilter}
                setVisitorTypeFilter={setVisitorTypeFilter}
            />
            <Row>
                <Col md={12}>
                    <CustomerStatsCard />
                </Col>
            </Row>

            {/* Stats Summary Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3 mb-lg-0">
                    <Card className="h-100">
                        <Card.Body className="text-center">
                            <FaUsers className="mb-2 text-primary" size={24} />
                            <Card.Title>Total Visits</Card.Title>
                            <h3>{stats.total}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3 mb-lg-0">
                    <Card className="h-100">
                        <Card.Body className="text-center">
                            <FaUserClock className="mb-2 text-success" size={24} />
                            <Card.Title>Visitor Types</Card.Title>
                            <div className="d-flex justify-content-around mt-3">
                                <div>
                                    <div className="small text-muted">New</div>
                                    <h4>{stats.newVisitors}</h4>
                                </div>
                                <div>
                                    <div className="small text-muted">Returning</div>
                                    <h4>{stats.returningVisitors}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3 mb-lg-0">
                    <Card className="h-100">
                        <Card.Body className="text-center">
                            <div className="mb-2">
                                <FaDesktop className="text-info me-2" size={20} />
                                <FaMobile className="text-success me-2" size={20} />
                                <FaTablet className="text-warning" size={20} />
                            </div>
                            <Card.Title>Devices</Card.Title>
                            <div className="d-flex justify-content-around mt-3">
                                <div>
                                    <div className="small text-muted">Desktop</div>
                                    <h5>{stats.devices.desktop}</h5>
                                </div>
                                <div>
                                    <div className="small text-muted">Mobile</div>
                                    <h5>{stats.devices.mobile}</h5>
                                </div>
                                <div>
                                    <div className="small text-muted">Tablet</div>
                                    <h5>{stats.devices.tablet}</h5>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="h-100">
                        <Card.Body className="text-center">
                            <FaGlobe className="mb-2 text-danger" size={24} />
                            <Card.Title>Top Location</Card.Title>
                            {stats.topCountries.length > 0 ? (
                                <div className="mt-3">
                                    <h4>{stats.topCountries[0].country}</h4>
                                    <div className="small text-muted">{stats.topCountries[0].count} visits</div>
                                </div>
                            ) : (
                                <div className="mt-3 text-muted">No data available</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Visits chart */}
            <div className="mb-4">
                <Card>
                    <Card.Body>
                        <Card.Title>Visit Trends</Card.Title>
                        <LogChart logs={filteredLogs} />
                    </Card.Body>
                </Card>
            </div>

            {/* Table */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title className="mb-3">Visitor Log Details</Card.Title>
                    <LogTable logs={paginatedLogs} />
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted">
                            Showing {paginatedLogs.length} of {filteredLogs.length} entries
                        </div>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default LogDashboard;