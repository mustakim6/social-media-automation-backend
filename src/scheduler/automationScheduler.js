
import cron from "node-cron";
import Automation from "../models/Automation.js";
import executeAutomation from "../services/automationExecutionService.js";


const startAutomationScheduler = () => {

    cron.schedule("* * * * *", async () => {

        try {

            const now = new Date();

            const dueAutomations =
                await Automation.find({
                    isActive: true,
                    isRunning: false,

                    $or: [
                        {
                            nextRunAt: {
                                $lte: now,
                            },
                        },
                        {
                            retryAt: {
                                $lte: now,
                            },
                        },
                    ],
                });


            if (dueAutomations.length === 0) {
                return;
            }


            console.log(
                `Found ${dueAutomations.length} due automation(s)`
            );


            for (const automation of dueAutomations) {

                try {

                    // --------------------------------
                    // Claim automation
                    // --------------------------------

                    const claimedAutomation =
                        await Automation.findOneAndUpdate(
                            {
                                _id: automation._id,
                                isActive: true,
                                isRunning: false,
                            },
                            {
                                $set: {
                                    isRunning: true,
                                },
                            },
                            {
                                returnDocument: "after",
                            }
                        );


                    if (!claimedAutomation) {

                        console.log(
                            `Automation ${automation._id} is already running. Skipping.`
                        );

                        continue;
                    }


                    try {

                        // --------------------------------
                        // Execute automation
                        // --------------------------------

                        await executeAutomation(
                            claimedAutomation
                        );

                    } finally {

                        // --------------------------------
                        // Release execution lock
                        // --------------------------------

                        await Automation.findByIdAndUpdate(
                            automation._id,
                            {
                                $set: {
                                    isRunning: false,
                                },
                            }
                        );
                    }


                } catch (error) {

                    console.error(
                        `Failed to execute automation ${automation._id}:`,
                        error.message
                    );
                }
            }


        } catch (error) {

            console.error(
                "Automation scheduler error:",
                error
            );
        }
    });


    console.log(
        "Automation scheduler started"
    );
};


export default startAutomationScheduler;

