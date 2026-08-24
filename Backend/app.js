const path = require('path');
const cors = require('cors');
const express = require('express');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');
const ApiError = require('./utils/apiError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalViteOrigin(origin) {
  try {
    const url = new URL(origin);
    return (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      && /^5\d{3}$/.test(url.port);
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    const allowLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production' && isLocalViteOrigin(origin);
    if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin) || allowLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new ApiError(403, 'Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
