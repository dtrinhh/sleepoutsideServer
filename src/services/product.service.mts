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

export default {
  getAllProducts,
  getProductById
};