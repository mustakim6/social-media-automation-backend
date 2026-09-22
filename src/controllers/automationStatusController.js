import {
    getExecutionStatuses,
} from "../services/executionStatusService.js";

const getAutomationStatuses = async (req, res) => {
    try {
        const userId = req.userId;

        const statuses =
            await getExecutionStatuses(userId);

        return res.status(200).json({
            status: "OK",
            data: statuses,
        });
    } catch (error) {
        console.error(
            "Get execution statuses error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to fetch execution statuses",
        });
    }
};

export {
    getAutomationStatuses,
};