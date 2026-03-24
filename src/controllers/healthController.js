import mongoose from 'mongoose';

export async function health(_req, res) {
  const db =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    data: {
      status: 'ok',
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}
