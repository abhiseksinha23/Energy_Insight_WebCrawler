const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    url: String,
    articles: String,
    title: String,
    content: String,
    link: String,
    image: String
});

module.exports = {
    siteSchema: siteSchema
}
