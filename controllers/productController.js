const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");

const validateMongodbId = require("../utils/validateMongodbId");
const Product = require("../models/product");
// Create Iphone

cloudinary.config({
  cloud_name: "daofedrqe",
  api_key: "134718912625193",
  api_secret: "JmfVNL4RpE6UgHRBX8w2ozwM0Fs",
});

//
const createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  try {
    // upload to cloudinary image avatar
    const uploadImagesAvts = [];
    for (let i = 0; i < data.imageAvt.length; ++i) {
      const uploadImageAvt = await cloudinary.uploader.upload(req.body.imageAvt[i], {
        folder: "wanfit_apple_imageAvt",
      });
      uploadImagesAvts.push(uploadImageAvt.secure_url);
    }
    // upload to cloudinary one describe image
    const lengthImageDescribe = req?.body?.imageDescribe;
    let newArrayDescribeImageColors = [];

    const promises = lengthImageDescribe?.map(async (imageDescribe, index) => {
      const color = req.body.colors[index];
      if (imageDescribe.hasOwnProperty(color)) {
        const imageDescribeColor = imageDescribe[color];
        const uploadDescribeImages = [];
        for (let i = 0; i < imageDescribeColor.length; ++i) {
          const uploadImageDescribe = await cloudinary.uploader.upload(imageDescribeColor[i], {
            folder: "wanfit_apple_imageDescribe",
          });
          uploadDescribeImages.push(uploadImageDescribe.secure_url);
        }
        const objectDescribeImageColor = { [color]: [...uploadDescribeImages] };
        newArrayDescribeImageColors.push(objectDescribeImageColor);
      }
    });

    await Promise.all(promises);

    const updateImageToData = await {
      ...data,
      imageAvt: uploadImagesAvts,
      imageDescribe: newArrayDescribeImageColors,
    };
    const newProduct = Product.create(updateImageToData);
    res.json({ message: "Thêm sản phẩm thành công", alert: true });
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  try {
    const newProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getOneProduct = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  try {
    const newProduct = await Product.findOne({ slug });
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering Price
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => {
      delete queryObj[el];
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    let query = Product.find(JSON.parse(queryStr));

    // Searching by category
    if (req?.query?.category) {
      queryObj.category = req.query.category;
    }

    // Searching by version
    if (req?.query?.version) {
      queryObj.version = req.query.version;
    }

    // // Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort("-createdAt");
    // }

    // Sorting
    if (req.query.sort) {
      const sortOptions = req.query.sort.split(",");
      sortOptions.forEach((option) => {
        if (option.startsWith("-")) {
          query = query.sort({ [option.slice(1)]: -1 }); // Sắp xếp giảm dần
        } else {
          query = query.sort({ [option]: 1 }); // Sắp xếp tăng dần
        }
      });
    } else {
      query = query.sort("-createdAt");
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }

    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const getProductSearch = asyncHandler(async (req, res) => {
  try {
    const { q, type } = req.query;

    let query = Product.find();
    if (q) {
      const regex = new RegExp(q, "i");
      query = query.where("title", regex);
    }

    if (type) {
      const limit = parseInt(type, 10);
      query = query.limit(limit);
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getOneProduct,
  getProductSearch,
};
