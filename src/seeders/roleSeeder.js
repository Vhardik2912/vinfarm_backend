const Role = require("../models/Role");

const seedRoles = async () => {
  try {
    const defaultRoles = ["admin", "staff", "customer"];

    for (const roleName of defaultRoles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        await Role.create({
          name: roleName,
          isActive: true,
        });
        console.log(`🔑 Role '${roleName}' created successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Role Seeder Error:", error.message);
  }
};

module.exports = seedRoles;
