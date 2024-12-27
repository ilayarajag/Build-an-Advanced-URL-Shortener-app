const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const router = express.Router();

// Google Auth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });
    res.json({ token, user });
  }
);

router.post('/signup', async (req, res) => {
  const { username, password,email ,name} = req.body;
  console.log(username);
  
  try {
    const user = new User({ username, password });

    const newUrl = await User.create({
      username:username,
       password:password,
       email: email,
       name: name,
          createdAt: new Date(),
        });
        console.log(newUrl);
        
    await newUrl.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  
  try {
    const user = await User.findOne({ username ,password});
    console.log(user);
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
   
    let isMatch = await bcrypt.compare(password, user.password);
        if (isMatch === false) {
          return res.status(400).json({ error: 'error credentials' });
        }

    //const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }
  
   
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    //res.json({ token });
    return res.status(200).json({ message: 'success credentials' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});



module.exports = router;
