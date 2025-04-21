import React, { useEffect, useState } from 'react';
import ExportCSV from './ExportCSV.js';
import FilterBar from './FilterBar.js'; // Assuming you have a FilterBar component
import LogChart from './LogChart.js'; // Assuming you have a LogChart component
import LogTable from './LogTable.js'; // Assuming you have a LogTable component
import CustomPagination from './CustomPagination.js';
import ReportDownloadButton from './ReportDownloadButton.js';

const LogDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    const totalPages = Math.ceil(logs.length / logsPerPage);
    const paginatedLogs = logs.slice(
        (currentPage - 1) * logsPerPage,
        currentPage * logsPerPage
    );

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await fetch('/api/visitors/logs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to fetch logs');
            }
            const data = await response.json();
            console.log(data);
            setLogs(data);
            setFilteredLogs(data);

            const uniquePages = [...new Set(data.map(log => log.page))];
            setPages(uniquePages);// Default to last 7 days

            const now = new Date();
            const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            setDateRange({
                start: lastWeek.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            });
        };

        fetchLogs();
    }, []);

    const uniquePages = [...new Set(logs.map(log => log.page))];

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

        setFilteredLogs(filtered);
    }, [selectedPage, dateRange, logs]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Visitor Logs Dashboard</h2>
            <div className="my-3">
                <p className="mb-2 font-semibold">Filter Logs by Page and Date:</p>
                <FilterBar
                    pages={uniquePages}
                    selectedPage={selectedPage}
                    onPageChange={setSelectedPage}
                    dateRange={dateRange}
                    onDateChange={setDateRange}
                />
                <ExportCSV logs={filteredLogs} />
                {/* <div><strong>Total Visits: </strong>{filteredLogs.length}</div> */}
            </div>
            <div className="mb-4">
                <ReportDownloadButton />
            </div>
            <p className="mb-2 font-semibold">Total Visits: {filteredLogs.length}</p>
            <LogChart logs={filteredLogs} />
            <LogTable logs={paginatedLogs} />
            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default LogDashboard;