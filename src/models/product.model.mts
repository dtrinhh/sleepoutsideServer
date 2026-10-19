import mongodb from "../database/index.mts";
import type { Product, FindProductObj} from "./types.mts";
// import { formatFields } from "../services/utils.mts"; Commented out because it's not being utilized
import type { Collection } from "mongodb";


async function getAllProducts(find: FindProductObj) {
    // Reference Products collection
    const productsCollection:Collection<Product> = mongodb.getDb().collection<Product>("products");
    // Total number of records that match the query
    const totalCount = await productsCollection.countDocuments(find.search);
    // Apply filters
    const cursor = await productsCollection.find(find.search).skip(find.offset).limit(find.limit);
    // Reduce to specified fields of requested
    if (find.fieldFilters) {
        cursor.project(find.fieldFilters);
    }
    // Convert result to an array
    const results = await cursor.toArray();
    console.log(totalCount, results);
    return { results, totalCount };
}

async function getProductsById(id:string): Promise<Product | null> {
    const product = await mongodb.getDb().collection<Product>("products").findOne({id: id});
    return product;
}


export default {
    getAllProducts,
    getProductsById
};


