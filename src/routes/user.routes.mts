import { Router } from 'express';
import { sanitize } from '../services/utils.mts';
import { login } from "../services/user.services.mts";
import EntityNotFoundError from '../errors/EntityNotFoundError.mts';

const router: Router = Router();

router.post('/login', async (req, res, next) => {
    try {
        // get the email and password from the body of the request
        const { email, password } = req.body;

        // sanitize them
        const cleanEmail = sanitize(email).toString();
        const cleanPassword = sanitize(password).toString();

        // call the service function, pass in the email and password.
        // the service function should return a valid user and token or null for either
        const result = await login(cleanEmail, cleanPassword);
        console.log(result);

        if (result.user == null || result.token == null) {
            // forward a 401 error if either is null
            return next(new EntityNotFoundError({message : "Could not find user or password", code: "ERR_NF", statusCode: 401}));
        }

        // if both values exist, Send back the token and some user info in the response 
        // { token, user: { _id: user._id, email: user.email, name: user.name } }
        res.status(200).json(result);
    } catch(error) {
        next(error);
    }
});

export default router;