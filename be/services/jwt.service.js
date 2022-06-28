var jwt = require('jsonwebtoken');
var crypto = require('crypto');
const jwtPassword = "giaynhap-030398"

const jwtMiddleWare = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] 
  if (token == null) return res.sendStatus(401) 
  jwt.verify(token, jwtPassword, (err, user) => { 
    if (err) return res.sendStatus(403)
    req.user = user 
    next()
  }) 
}

const  generateAccessToken = (data) => {
    return jwt.sign(data, jwtPassword, { expiresIn: '1800s' });
}

const getRefreshToken = (accessToken) => {
   return crypto.createHash('md5').update(accessToken+jwtPassword).digest("hex"); 
}

const getAccessTokenPayload = (accessToken) => {
   return  jwt.decode( accessToken )
}

module.exports = {
    jwtMiddleWare, 
    generateAccessToken,
    getRefreshToken,
    getAccessTokenPayload
}