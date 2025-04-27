const mongoose = require('mongoose');

class DBconnection{
    connectDB() {
        mongoose.connect(process.env.MONGO_URI)
        console.log('Database connected......')
    }
}
module.exports = new DBconnection();