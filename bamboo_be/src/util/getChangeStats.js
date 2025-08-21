const getChangeStats = function (current, previous) {
    let value = 0;
    let isIncrease = false;
    let isEqual = false;

    if (previous === 0) {
        if (current === 0) {
            isEqual = true;
        } else {
            value = 100;
            isIncrease = true;
        }
    } else {
        const change = ((current - previous) / previous) * 100;
        value = Math.abs(change.toFixed(2)); // Luôn hiển thị số dương
        isIncrease = change > 0;
        isEqual = change === 0;
    }

    return { value, isIncrease, isEqual };
};

module.exports = getChangeStats;
