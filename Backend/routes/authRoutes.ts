import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ success: true, user: { id: '1', name: 'Admin', role: 'admin' } });
});

export default router;
