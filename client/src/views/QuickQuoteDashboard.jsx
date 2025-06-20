import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Paper, Divider } from '@mui/material';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';



const QuickQuoteDashboard = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter(q =>
    q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.phonenumber?.includes(searchTerm) ||
    q.postalcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );



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
        <TextField
          variant="outlined"
          placeholder="Search by name, phone, or postal code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <DataGrid
          rows={filteredQuotes.map(q => ({ ...q, id: q._id }))}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params) => setSelectedQuote(params.row)}
          autoHeight={false}
          checkboxSelection={false}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
            },
            '& .MuiDataGrid-cell': {
              py: 1,
            },
          }}
        />
      </Box>

      {/* Right side: Selected Quote Details */}
      <Box flex={1}>
        {selectedQuote ? (
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Quote Details</Typography>

            <Box>
              <Typography><strong>Name:</strong> {selectedQuote.name}</Typography>
              <Typography><strong>Email:</strong> {selectedQuote.email || 'N/A'}</Typography>
              <Typography><strong>Phone:</strong> {selectedQuote.phonenumber}</Typography>
              <Typography><strong>Company:</strong> {selectedQuote.companyName || 'N/A'}</Typography>
              <Typography><strong>Postal Code:</strong> {selectedQuote.postalcode}</Typography>
              <Typography><strong>Promo Code:</strong> {selectedQuote.promoCode || 'N/A'}</Typography>
              <Typography><strong>Submitted:</strong> {new Date(selectedQuote.createdAt).toLocaleString()}</Typography>
            </Box>

            <Divider />

            {/* Services */}
            <Box>
              <Typography variant="subtitle1"><strong>Services Requested:</strong></Typography>
              {selectedQuote.services?.length ? (
                selectedQuote.services.map((service, index) => (
                  <Box key={index} ml={2} mt={1}>
                    <Typography variant="body1" fontWeight="bold">
                      • {service.type}: {service.service}
                    </Typography>
                    {service.customOptions && Object.keys(service.customOptions).length > 0 && (
                      <Box ml={2} mt={0.5}>
                        <Typography variant="body2" fontWeight="medium">Custom Options:</Typography>
                        {Object.values(service.customOptions).map((option, i) => (
                          <Typography key={i} variant="body2">
                            {option.label ? `${option.label}: ` : ''}
                            {typeof option.service === 'boolean'
                              ? (option.service ? 'Yes' : 'No')
                              : (option.service?.toString() || 'N/A')}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Typography ml={2}>No services listed.</Typography>
              )}
            </Box>

            {/* CTA Button */}
            <Box mt={3}>
              <a
              // add service type to the URL
                href={`/booking-dashboard?name=${encodeURIComponent(selectedQuote.name)}&email=${encodeURIComponent(selectedQuote.email || '')}&serviceType=${encodeURIComponent(selectedQuote.services[0]?.type || '')}&service=${encodeURIComponent(selectedQuote.services[0]?.service || '')}`}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  component="button"
                  sx={{
                    width: '100%',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    py: 1,
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  Book This Job
                </Box>
              </a>
            </Box>
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
