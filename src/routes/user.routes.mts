import { Router } from 'express';
import { sanitize } from '../services/utils.mts';
import { login } from "../services/user.services.mts";
import EntityNotFoundError from '../errors/EntityNotFoundError.mts';
import { register } from '../services/user.services.mts';
import authorize from '../middleware/authorize.mts';

const router: Router = Router();

router.post('/login', async (req, res, next) => {
    try {
        // get the email and password from the body of the request and sanitize
        const cleanBody = sanitize(req.body);
        const { email, password } = cleanBody;

        // call the service function, pass in the email and password.
        // the service function should return a valid user and token or null for either
        const result = await login(email, password);
        console.log(result);

        if (!result.user || !result.token) {
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

router.post('/', async (req, res, next) =>  {
    try {
        const cleanBody = sanitize(req.body);
        const { email, password, name } = cleanBody;

        const newUser = await register(email, password, name);

        res.status(200).json({message:"User created successfully", userId: newUser.insertedId});
        } catch (error) {
        next(error);
    }
});

router.get('/protected', authorize, (req, res) => {
    console.log(res.locals.user);
    res.json({ message: `Hello, ${res.locals.user.email}!` });
})

export default router;