const express = require("express");
const { getRoles, getRole, createRole, updateRole, deleteRole } = require("../controllers/roleController");

const router = express.Router();

router.get("/get", getRoles);
router.get("/getid/:id", getRole);
router.post("/post", createRole);
router.put("/put/:id", updateRole);
router.delete("/delete/:id", deleteRole);

module.exports = router;
