const express = require('express');
const app = express();
require('dotenv').config();
const rateLimit = require('express-rate-limit')
const db=require('./config/db');
const path = require('path');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 10, // Limit each IP to 10 requests per `window` (here, per 1 minute).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})
app.use(limiter);
app.use(require('./routes/user.router'));
app.use('/category',require('./routes/cat.router'));
app.use('/product',require('./routes/prod.router'));
app.use('/review',require('./routes/review.router'));
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);
    db.connectDB();
});



