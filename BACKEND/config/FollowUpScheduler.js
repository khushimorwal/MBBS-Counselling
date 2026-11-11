const cron = require("node-cron");
const FollowUp = require("../Models/FollowUp");

const startFollowUpScheduler = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await FollowUp.updateMany(
        {
          status: "pending",
          dueAt: { $lte: new Date() },
        },
        {
          $set: { status: "overdue" },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `FollowUps marked overdue: ${result.modifiedCount}`
        );
      }
    } catch (error) {
      console.error("FollowUp Scheduler Error:", error);
    }
  });

  console.log("FollowUp scheduler started.");
};

module.exports = startFollowUpScheduler;