const express = require('express');
const app = express();
require('dotenv').config();
const db=require('./config/db');
const path = require('path');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.use(require('./routes/user.router'));
app.use('/category',require('./routes/cat.router'));
app.use('/product',require('./routes/prod.router'));
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);
    db.connectDB();
});



