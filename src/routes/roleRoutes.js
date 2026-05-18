const express = require("express");
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

const router = express.Router();

router.post("/post", createRole);
router.get("/get", getRoles);
// router.post("/getid", getRole);
// router.post("/put", updateRole);
// router.post("/delete", deleteRole);

module.exports = router;
