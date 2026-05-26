const Role = require("../models/Role");
const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");

const defaultCustomers = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@resort.com",
    phone: "9876500001",
    address: "12 Hill View Road, Mumbai",
    loyaltyPoints: 120,
  },
  {
    name: "Michael Chen",
    email: "mchen@resort.com",
    phone: "9876500002",
    address: "45 Lake Side Avenue, Pune",
    loyaltyPoints: 80,
  },
  {
    name: "Emma Williams",
    email: "emma.w@resort.com",
    phone: "9876500003",
    address: "9 Green Valley Lane, Bangalore",
    loyaltyPoints: 200,
  }

];

const seedCustomer = async () => {
  try {
    // Find customer role
    const customerRole = await Role.findOne({ name: "customer" });

    if (!customerRole) {
      console.error("❌ Customer role not found. Run roleSeeder first.");
      return;
    }

    for (const customer of defaultCustomers) {
      // Check if user already exists
      let customerUser = await User.findOne({
        email: customer.email,
      });

      // Create user if not exists
      if (!customerUser) {
        customerUser = await User.create({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          password: "123456", // default password
          roleId: customerRole._id,
        });

        console.log(`✅ User created: ${customer.name}`);
      }

      // Check if profile already exists
      const existingProfile = await CustomerProfile.findOne({
        userId: customerUser._id,
      });

      if (!existingProfile) {
        await CustomerProfile.create({
          userId: customerUser._id,
          address: customer.address,
          loyaltyPoints: customer.loyaltyPoints,
          document: "/uploads/mock-document.pdf",
        });

        console.log(
          `👤 Customer profile created: ${customer.name}`
        );
      }
    }

    console.log("🎉 Default customers seeded successfully.");
  } catch (error) {
    console.error("❌ Customer Seeder Error:", error.message);
  }
};

module.exports = seedCustomer;