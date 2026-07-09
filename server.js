const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000; // Render uses process.env.PORT, default to 10000 if not set

// Serve static assets
app.use(express.static(path.join(__dirname)));

// Route clean path /admin directly to admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});
