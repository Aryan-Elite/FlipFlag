import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";

export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  // console.log("here is the user's session :",session);
  
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.user = session.user;
  next();
}
