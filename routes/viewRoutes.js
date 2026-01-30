const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");

router.get("/", viewController.getIndex);
router.get("/culture", viewController.getCulture);
router.get("/visualizer", viewController.getVisualizer);
router.get("/study-buddy", viewController.getStudyBuddy);
router.get("/kida", viewController.getKida);
router.get("/tutor", viewController.getTutor);

module.exports = router;