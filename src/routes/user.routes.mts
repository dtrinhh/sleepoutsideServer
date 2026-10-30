import { Router } from 'express';
import { sanitize } from '../services/utils.mts';

const router: Router = Router();

router.post('/login', async (req, res, next) => {
    // get the email and password from the body of the request
    const { email, password } = req.body;

  // sanitize them
  const cleanEmail = sanitize(email);

  // call the service function, pass in the email and password.
  // the service function should return a valid user and token or null for either
  
    
    // forward a 401 error if either is null
   
    // if both values exist, Send back the token and some user info in the response 
    // { token, user: { _id: user._id, email: user.email, name: user.name } }
});