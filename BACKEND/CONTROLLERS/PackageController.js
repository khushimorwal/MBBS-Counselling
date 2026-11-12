
const razorpay = require("../config/razorpay");
const Payment = require("../Models/Payment");
const Package = require("../Models/Package");
const User = require("../Models/User");
const crypto = require("crypto");

// ======================================
// CREATE RAZORPAY ORDER
// ======================================
const createOrder = async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
    }

    // Find package from MongoDB
    const selectedPackage = await Package.findById(packageId);

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Only active packages can be purchased
    if (selectedPackage.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This package is not available",
      });
    }

    if (
      !Number.isFinite(selectedPackage.price) ||
      selectedPackage.price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package price",
      });
    }

    // Create Razorpay order using database price
    const options = {
      amount: Math.round(selectedPackage.price * 100),
      currency: "INR",
      receipt: `pkg_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment
    await Payment.create({
      student: req.user.id,
      package: selectedPackage._id,
      packageName: selectedPackage.name,
      amount: selectedPackage.price,
      orderId: order.id,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      key: process.env.RAZORPAY_KEY_ID,
      order,
      package: {
        id: selectedPackage._id,
        name: selectedPackage.name,
        price: selectedPackage.price,
      },
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// ======================================
// VERIFY RAZORPAY PAYMENT
// ======================================
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing",
      });
    }

    // Find student's payment
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      student: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (payment.status === "Success") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        package: payment.packageName,
      });
    }

    // Verify signature
    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    let isValid = false;

    try {
      const received = Buffer.from(razorpay_signature, "hex");
      const expected = Buffer.from(expectedSignature, "hex");

      isValid =
        received.length === expected.length &&
        received.length > 0 &&
        crypto.timingSafeEqual(received, expected);
    } catch (error) {
      isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Verify payment directly with Razorpay
    const razorpayPayment =
      await razorpay.payments.fetch(razorpay_payment_id);

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      razorpayPayment.amount !== Math.round(payment.amount * 100) ||
      razorpayPayment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match",
      });
    }

    // Save successful payment
    payment.paymentId = razorpay_payment_id;
    payment.status = "Success";

    await payment.save();

    // Activate purchased package for student
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        activePackage: payment.package,
        planStatus: "Active",
        planActivatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and package activated",
      package: payment.packageName,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ======================================
// ACTIVATE FREE PLAN
// ======================================
// ======================================
// ACTIVATE FREE PACKAGE
// ======================================
const activateFreePlan = async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
    }

    // MongoDB se package find karo
    const selectedPackage = await Package.findById(packageId);

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Package active hona chahiye
    if (selectedPackage.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This package is not available",
      });
    }

    // Sirf zero-price package activate hoga
    if (selectedPackage.price !== 0) {
      return res.status(400).json({
        success: false,
        message: "This is not a free package",
      });
    }

    // Student ka package activate karo
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          activePackage: selectedPackage._id,
          activePlan: "free",
          planStatus: "Active",
          planActivatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Free package activated successfully",
      package: {
        id: selectedPackage._id,
        name: selectedPackage.name,
        price: selectedPackage.price,
      },
    });

  } catch (error) {
    console.error("Free Package Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to activate free package",
    });
  }
};

// ======================================
// GET ALL ACTIVE PACKAGES
// ======================================
const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({
      status: "Active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      packages,
    });

  } catch (error) {
    console.error("Get Packages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch packages",
    });
  }
};

// ======================================
// EXPORT
// ======================================
module.exports = {
  getAllPackages,
  createOrder,
  verifyPayment,
  activateFreePlan,
  
};
