const Role = require("../models/Role");
const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");

const seedCustomer = async () => {
  try {
    const customerRole = await Role.findOne({ name: "customer" });
    if (customerRole) {
      const customerEmail = "customer@example.com";
      let customerUser = await User.findOne({ email: customerEmail });
      if (!customerUser) {
        customerUser = await User.create({
          name: "John Doe",
          email: customerEmail,
          phone: "1234567890", // This acts as their login password/credential
          roleId: customerRole._id,
          isActive: true,
        });

        await CustomerProfile.create({
          userId: customerUser._id,
          address: "123 Resort Lane, Eco Valley",
          loyaltyPoints: 100,
        });
        console.log("👤 Default Customer seeded successfully.");
      }
    }
  } catch (error) {
    console.error("❌ Customer Seeder Error:", error.message);
  }
};

module.exports = seedCustomer;
