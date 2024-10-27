const mongoose = require('mongoose');

const visitorCountSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    },
});

// const visitorLogSchema = new mongoose.Schema({
//     page: { 
//         type: String, 
//         required: true 
//     },
//     visitDate: { 
//         type: Date, 
//         default: Date.now 
//     }, // Timestamp for each visit
//     count: { 
//         type: Number, 
//         default: 0 
//     }, // Number of visits
// });

const VisitorCount = mongoose.model('VisitorCount', visitorCountSchema);

module.exports = VisitorCount;

