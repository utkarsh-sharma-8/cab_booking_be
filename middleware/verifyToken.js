const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json({error:"Token Not Provided"});
  }
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Invalid Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if contact in token matches the one in request body (or query)
    // Normalize contact from token and request to lowercase
    const requestContact = req.body.phone?.toLowerCase() || req.query.contact?.toLowerCase();
    const tokenContact = decoded.phone.toLowerCase();
    console.log(`verify token middleware tokenContract is ${tokenContact}`);
    if (requestContact && tokenContact !== requestContact) {
      return res.status(403).json({ message: "Forbidden: Token Mismatch" });
    }

    // Attach the decoded user to the request object
    req.user = decoded;
    req.token = token;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token Expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid Token" });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { verifyToken };
