const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Optimize server speed globally
app.use(compression({ level: 6, threshold: 500 })); // Only compress responses > 500 bytes

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://ai-clinic-pro.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection
connectDB();

// Routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Serve static PDF uploads
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/api/health', (req, res) => {
   

// Keep-alive endpoint to prevent Render spindown
app.get('/api/keep-alive', (req, res) => {
    res.status(200).json({ alive: true });
}); res.json({ status: 'ok', message: 'AI Clinic Manager API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
