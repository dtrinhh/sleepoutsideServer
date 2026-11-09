import productModel from "../models/product.model.mts";
import type { Product, QueryParams, FindProductObj } from "../models/types.mts";
import { formatFields, buildPaginationWrapper } from "./utils.mts";


const getAllProducts = async (query: QueryParams) => {
  let find:FindProductObj = {search: {},
    limit: query.limit? parseInt(query.limit) : 20,
    offset: query.offset? parseInt(query.offset) : 0
  }

  const {q, category, fields} = query;

  find.fieldFilters = fields? formatFields(fields): undefined;
  if (category) {
    find.search.category = category;
  }
  if (q) {
    find.search.name = q;
    find.search.descriptionHtmlSimple = q;
  }

  const data = await productModel.getAllProducts(find);

  const wrapper = buildPaginationWrapper(data.totalCount, query);
  wrapper.results = data.results;
  return wrapper;
};

const getProductById = async (id: string) => {
  return await productModel.getProductsById(id);
};

const getProductsBySearch = async (query: QueryParams) => {
  const searchTerm = query.q?.trim();
  if (!searchTerm) {
    return null;
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const find: FindProductObj = {
    search: {
      $or: [
        { category: { $regex: escapedSearchTerm, $options: "i" } },
        { name: { $regex: escapedSearchTerm, $options: "i" } },
        { descriptionHtmlSimple: { $regex: escapedSearchTerm, $options: "i" } }
      ]
    },
    limit: query.limit ? parseInt(query.limit) : 20,
    offset: query.offset ? parseInt(query.offset) : 0,
    fieldFilters: query.fields ? formatFields(query.fields) : undefined
  };

  const data = await productModel.getAllProducts(find);
  const wrapper = buildPaginationWrapper(data.totalCount, query);
  wrapper.results = data.results;
  return wrapper;
};

export default {
  getAllProducts,
  getProductById,
  getProductsBySearch
};