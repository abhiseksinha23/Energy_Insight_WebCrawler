const mongoose = require('mongoose');

const subscribeSchema = new mongoose.Schema({
    name: String,
    email: String,
    topic: String
});

module.exports = {
    subscribeSchema: subscribeSchema
}
