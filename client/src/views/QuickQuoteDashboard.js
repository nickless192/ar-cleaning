import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';

const QuickQuoteDashboard = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(`/api/quotes/quickquote?page=1&limit=${pageSize}`); // Adjust API path if needed
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        const data = await response.json();
        // console.log(data.quotes);
        setQuotes(data.quotes || []);
      } catch (err) {
        console.error('Error fetching quotes:', err);
      }
    };

    fetchQuotes();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Customer Name', flex: 1 },
    { field: 'phonenumber', headerName: 'Phone', flex: 1 },
    { field: 'postalcode', headerName: 'Postal Code', flex: 1 },
    { 
      field: 'createdAt', 
      headerName: 'Submitted At', 
      flex: 1
    }
  ];

  return (
    <Box display="flex" height="calc(100vh - 100px)" gap={2} p={2}>
      
      {/* Left side: Quotes list */}
      <Box flex={1}>
        <Typography variant="h5" mb={2}>Submitted Quotes</Typography>
        <DataGrid
          rows={quotes.map(q => ({ ...q, id: q._id }))}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params) => setSelectedQuote(params.row)}
          autoHeight={false}
          checkboxSelection
        />
      </Box>

      {/* Right side: Selected Quote Details */}
      <Box flex={1}>
        {selectedQuote ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Quote Details</Typography>
            <Typography><strong>Name:</strong> {selectedQuote.name}</Typography>
            <Typography><strong>Email:</strong> {selectedQuote.email || 'N/A'}</Typography>
            <Typography><strong>Phone:</strong> {selectedQuote.phonenumber}</Typography>
            <Typography><strong>Company:</strong> {selectedQuote.companyName || 'N/A'}</Typography>
            <Typography><strong>Postal Code:</strong> {selectedQuote.postalcode}</Typography>
            <Typography><strong>Promo Code:</strong> {selectedQuote.promoCode || 'N/A'}</Typography>
            <Typography><strong>Submitted:</strong> {new Date(selectedQuote.createdAt).toLocaleString()}</Typography>

            {/* Services */}
            <Box mt={2}>
              <Typography variant="subtitle1"><strong>Services Requested:</strong></Typography>
              {selectedQuote.services && selectedQuote.services.length ? (
                selectedQuote.services.map((service, index) => (
                  <Box key={index} ml={2}>
                    <Typography>- {service.type}: {service.service}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>No services listed.</Typography>
              )}
            </Box>

            {/* Products can be added here if needed */}
          </Paper>
        ) : (
          <Paper elevation={1} sx={{ p: 3, color: 'gray', textAlign: 'center' }}>
            <Typography>Select a quote to view details</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default QuickQuoteDashboard;
