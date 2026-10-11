import productModel from "../models/product.model.mts";


 const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

const getProductById = async (id: string) => {
  return await productModel.getProductsById(id);
};

export default {
  getAllProducts,
  getProductById
};