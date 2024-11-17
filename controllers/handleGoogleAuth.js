const querystring = require("querystring");
const User = require("../db/userModel");
const jwt = require("jsonwebtoken");

const handleGoogleAuth = async (req, res) => {
  const redirectURI = `${process.env.protocol}${process.env.backend_url}/projects/chat-app/api/auth/google/callback`
  const clientId = process.env.client_id;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
    client_id: clientId,
    redirect_uri: redirectURI,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
  })}`;

  res.redirect(authUrl);
};

module.exports = handleGoogleAuth;