// Imported mongodb containing the client and database (from the export default
// statement in database/index.mts) instead of creating a new client here
import mongodb from "../database/index.mts";
import type {User} from "./types.mts";


// Find user by email function: part 1 step 4
export async function getUserByEmail(userEmail:string) {
  const user = await mongodb.getDb().collection<User>("users").findOne({email: userEmail});
  return user;
};