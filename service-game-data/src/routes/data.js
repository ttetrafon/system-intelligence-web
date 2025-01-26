import express from 'express';

const router = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log(`Request received at /data:`, req.method);
  next();
});

// POST /data
router.post('/', (req, res) => {
  res.json({ received: req.body, message: 'Data processed successfully!' });
});

export default router;