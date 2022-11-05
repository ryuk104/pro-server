import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	//TODO
	res.json([]).status(200);
});

export default router;
