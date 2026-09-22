import FacebookPage from "../models/FacebookPage.js";
import Automation from "../models/Automation.js";
import ExecutionStatus from "../models/ExecutionStatus.js";

const getDashboardData = async (userId) => {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );

    // Overview counts
    const [
        totalPages,
        totalAutomations,
        activeAutomations,
        pausedAutomations,
        successfulExecutions,
        failedExecutions,
    ] = await Promise.all([
        FacebookPage.countDocuments({
            userId,
            isActive: true,
        }),

        Automation.countDocuments({
            userId,
        }),

        Automation.countDocuments({
            userId,
            isActive: true,
        }),

        Automation.countDocuments({
            userId,
            isActive: false,
        }),

        ExecutionStatus.countDocuments({
            userId,
            status: "success",
            executedAt: {
                $gte: sevenDaysAgo,
            },
        }),

        ExecutionStatus.countDocuments({
            userId,
            status: "failed",
            executedAt: {
                $gte: sevenDaysAgo,
            },
        }),
    ]);

    // Upcoming automations
    const upcomingAutomations =
        await Automation.find({
            userId,
            isActive: true,
            nextRunAt: {
                $ne: null,
            },
        })
            .sort({ nextRunAt: 1 })
            .limit(5)
            .populate(
                "facebookPageId",
                "pageName pageId"
            );

    // Recent execution activity
    const recentActivity =
        await ExecutionStatus.find({
            userId,
            executedAt: {
                $gte: sevenDaysAgo,
            },
        })
            .sort({ executedAt: -1 })
            .limit(10)
            .populate(
                "automationId",
                "prompt postingTime timezone"
            );

    return {
        overview: {
            totalPages,
            totalAutomations,
            activeAutomations,
            pausedAutomations,
        },

        executionSummary: {
            successful: successfulExecutions,
            failed: failedExecutions,
        },

        upcomingAutomations,
        recentActivity,
    };
};

export default getDashboardData;