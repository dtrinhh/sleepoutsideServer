import { getUserByEmail } from "../models/user.model.mts";
import type {User} from "../models/types.mts";
import * as argon2 from "argon2";
import { generateToken } from "./utils.mts";
import { UserSchema } from "../database/json-schema.ts";
import { validator } from "./utils.mts";
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";
import { createNewUser } from "../models/user.model.mts";

export async function login(email:string, password:string) {
  // Check if the user exists in the database. the user will be providing an 
  // email as identifier...so we will need a function in the model to 
  // retrieve a user by email
  let user: User | null = null;
  let token = null;
  user = await getUserByEmail(email);
  
    // check to see if a user was found, and that the password provided 
    // matches the one returned from the database. Remember that the 
    // password in the database is hashed and salted...so we need to use 
    // argon2 to verify it "argon2.verify(password, passwordHash)"
    if (user) {
      if (await argon2.verify(user.password, password)) {
      // If the user exists and password matches...then generate a token 
      // using jsonwebtoken
        token = await generateToken(user);
      }
    }

    // Send back the token and some user info to the route, either or both 
    // could be null.
    return { user, token };
};

export async function register(email:string, password:string, name:string) {
  const user = getUserByEmail(email);
  if (await user) {
    throw new EntityNotFoundError({message: "user already exists", statusCode: 409});
  }

  const hashedPassword = await argon2.hash(password);
    const newUser = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      modifiedAt: new Date()
    }

    validator(UserSchema, newUser);

    await createNewUser(newUser);

    // Reuse the login flow so a newly registered user receives a session token.
    return login(email, password);
}