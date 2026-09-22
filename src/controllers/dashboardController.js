import getDashboardData from "../services/dashboardService.js";

const getDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const dashboardData =
            await getDashboardData(userId);

        return res.status(200).json({
            status: "OK",
            data: dashboardData,
        });
    } catch (error) {
        console.error(
            "Get dashboard data error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to fetch dashboard data",
        });
    }
};

export { getDashboard };