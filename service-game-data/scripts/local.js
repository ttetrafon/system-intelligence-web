import express from 'express';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from local Express!' });
});

app.post('/data', (req, res) => {
  res.json({ received: req.body });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
});
