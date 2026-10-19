import type { QueryParams } from "../models/types.mts";

export function formatFields(fields: string) {
    const fieldsArr = fields?.split(",");

    if (fieldsArr) {
        const filter = fieldsArr
        .map((field: string) => field.trim())
        .reduce((acc: Record<string, any>, current:string) => ({ ...acc, [current]: 1 }), {});
        // To view the data
        console.log("formatFields:", filter);
        return filter;
    }
};

export function buildPaginationWrapper(totalCount: number, query: QueryParams) {
    const limit = query.limit? parseInt(query.limit) : 20;
    const offset = query.offset? parseInt(query.offset) : 0;

    const totalPages = Math.ceil(totalCount / limit);

    const currentPage = Math.ceil(offset / limit) + 1;

    const hasPreviousPage = currentPage > 1;
    console.log(currentPage, totalPages);

    const hasNextPage = currentPage < totalPages;
    let next, prev;

    const params = new URLSearchParams(query as Record<string, any>);

    if (hasPreviousPage) {
        params.set("offset", (offset - limit).toString());
        prev = `/?${params}`;
    }
    if (hasNextPage) {
        params.set("offset", (offset + limit).toString());
        prev = `/?${params}`;
    }

    return {
        count: totalCount,
        prev: prev || null,
        next: next || null,
        results: [] as any
    }
};