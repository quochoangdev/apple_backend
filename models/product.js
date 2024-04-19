const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    imageAvt: {
      type: Array,
    },
    imageDescribe: {
      type: Array,
    },
    colors: {
      type: Array,
      require: true,
    },
    capacitys: {
      type: Array,
      require: true,
    },
    percentDiscount: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
      sparse: true,
      slugOn: { updateOne: true },
    },
    new: {
      require: true,
      type: Boolean,
    },
    // ratings: [
    //   {
    //     start: Number,
    //     postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

mongoose.plugin(slug);

module.exports = mongoose.model("Product", productSchema);

// new:boolean
