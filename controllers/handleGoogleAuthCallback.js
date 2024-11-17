const querystring = require("querystring");
const { parse } = require("url");
const User = require("../db/userModel");
const jwt = require("jsonwebtoken");

const handleGoogleAuthCallback = async(req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No code found');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      code,
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      redirect_uri: `${process.env.protocol}${process.env.backend_url}/projects/chat-app/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return res.status(400).json({ error: tokenData.error_description });
  }

  const { access_token } = tokenData;

  // Step 3: Use the access token to fetch user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const userData = await userResponse.json();
   // Check if user already exists in the database
   let user = await User.findOne({ email: userData.email });
   let token;
 
   if (!user) {
     // If user doesn't exist, create a new user
     try {
       user = await User.create({
         email: userData.email,
         name: userData.name,
         picture: userData.picture
       });
     } catch (err) {
       return res.status(500).send({ message: "Error creating User" });
     }
   }
 
   // Generate a JWT token
   token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: "5h" });
  // Step 4: Handle user data (you can store it in your database here)
  const frontendOrigin = `${process.env.frontend_uri}`;
  
  res.send(`
    <script>
      window.opener.postMessage('${token}', "http://localhost:5173"); 
      window.close();
    </script>
  `);
};



module.exports = handleGoogleAuthCallback;
