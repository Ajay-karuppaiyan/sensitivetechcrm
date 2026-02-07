const mongoose = require("mongoose");

const PreviewSchema = new mongoose.Schema(
  {
    clientInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      company: String,
      notes: String,
    },

    requirements: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preview", PreviewSchema);
