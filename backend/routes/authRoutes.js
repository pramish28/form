import express from "express";
import { signup, signin, exportToExcel } from "../controller/authcontroller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", signin);
router.get("/download-excel", exportToExcel);

export default router;
