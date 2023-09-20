require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000', 
        // 'https://your-production-url.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const userRoutes = require('./src/routes/userRoutes');
const formRoutes = require('./src/routes/formRoutes');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/forms', formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
