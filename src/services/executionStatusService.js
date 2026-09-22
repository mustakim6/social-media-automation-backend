import ExecutionStatus from "../models/ExecutionStatus.js";

const recordExecutionStatus = async ({
    userId,
    automationId,
    status,
    provider,
}) => {
    const executionStatus = await ExecutionStatus.create({
        userId,
        automationId,
        status,
        provider,
        executedAt: new Date(),
    });

    return executionStatus;
};

const getExecutionStatuses = async (userId) => {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );

    const statuses = await ExecutionStatus.find({
        userId,
        executedAt: {
            $gte: sevenDaysAgo,
        },
    })
        .sort({ executedAt: -1 })
        .populate(
            "automationId",
            "prompt postingTime timezone"
        );

    return statuses;
};

export {
    recordExecutionStatus,
    getExecutionStatuses,
};