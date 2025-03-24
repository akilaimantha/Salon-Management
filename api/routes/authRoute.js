import express from "express";
import { signOut, login, signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/signout", signOut);

export default router;
