import type { QueryParams, User } from "../models/types.mts";
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "300s" as any;

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

export function sanitize(v: Record<string, any>) {
    if (typeof v === "object") {
        for (var key in v) {
            console.log(key,/^\$/.test(key) );
            if (/^\$/.test(key) ) {
                delete v[key];
            } else {
                sanitize(v[key]);
            }
        }
    }

    return v;
};

export async function generateToken(user:User) {
    const token = (jwt.sign(user, jwtSecret, {expiresIn: jwtExpiresIn}));

    return token;
}