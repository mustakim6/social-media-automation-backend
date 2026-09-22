import { DateTime } from "luxon";

const calculateNextRunAt = ({
    postingTime,
    timezone,
}) => {
    const [hour, minute] = postingTime.split(":").map(Number);

    const now = DateTime.now().setZone(timezone);

    let nextRun = now.set({
        hour,
        minute,
        second: 0,
        millisecond: 0,
    });

    // আজকের scheduled time পার হয়ে গেলে
    // আগামীকাল একই সময়ে run হবে
    if (nextRun <= now) {
        nextRun = nextRun.plus({ days: 1 });
    }

    return nextRun.toUTC().toJSDate();
};

export default calculateNextRunAt;