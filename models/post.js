const mongoose = require("mongoose");



const postSchema = mongoose.Schema({
  checkin: String,
  checkout: String,
  place: String,
  zone: String,
  day: String,
  gypsynumber: String,
  driver: String,
  gypsyby: String,
  gypsypayment: Number,
  collection: Number,
  expense: Number,
  petrol: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", postSchema);
