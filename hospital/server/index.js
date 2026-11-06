const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { requestLogger, notFound, errorHandler } = require('./middleware');

const app = express();
const port = Number(process.env.API_PORT) || 4000;
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '32kb' }));
app.use(requestLogger);
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log(`Medical API listening on http://localhost:${port}`));
