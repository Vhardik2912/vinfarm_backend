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
  },
  {
    name: "John Doe",
    email: "customer@example.com",
    phone: "1234567890",
    address: "123 Resort Lane, Eco Valley",
    loyaltyPoints: 100,
  },
];

const seedCustomer = async () => {
  try {
    const customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      console.error("❌ Customer role not found. Run roleSeeder first.");
      return;
    }

<<<<<<< HEAD
    const profileCount = await CustomerProfile.countDocuments();
    if (profileCount > 0) {
      return;
    }

    for (const customer of defaultCustomers) {
      const existing = await User.findOne({ email: customer.email });
      if (existing) continue;

      const customerUser = await User.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        roleId: customerRole._id,
        isActive: true,
      });

      await CustomerProfile.create({
        userId: customerUser._id,
        address: customer.address,
        loyaltyPoints: customer.loyaltyPoints,
      });

      console.log(`👤 Customer ${customer.email} seeded successfully.`);
=======
        await CustomerProfile.create({
          userId: customerUser._id,
          address: "123 Resort Lane, Eco Valley",
          loyaltyPoints: 100,
          roomType: "Family",
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
          document: "/uploads/mock-document.pdf",
          price: 5000,
          status: "pending",
        });
        console.log("👤 Default Customer seeded successfully.");
      }
>>>>>>> 97ca04ff6b977150f2b0e055145330b5d7ded1c5
    }
  } catch (error) {
    console.error("❌ Customer Seeder Error:", error.message);
  }
};

module.exports = seedCustomer;
