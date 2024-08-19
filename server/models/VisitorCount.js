const mongoose = require('mongoose');

const visitorCountSchema = new mongoose.Schema({
    page: { 
        type: String,
         required: true, 
         unique: true },
    count: { 
        type: Number, 
        default: 0 },
});

const VisitorCount = mongoose.model('VisitorCount', visitorCountSchema);

module.exports = VisitorCount;

