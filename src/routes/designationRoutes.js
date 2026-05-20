const express = require("express");
const { getDesignations, getDesignation, createDesignation, updateDesignation, deleteDesignation } = require("../controllers/designationController");

const router = express.Router();

router.get("/get", getDesignations);
router.get("/getid/:id", getDesignation);
router.post("/post", createDesignation);
router.put("/put/:id", updateDesignation);
router.delete("/delete/:id", deleteDesignation);

module.exports = router;
