const getWeeklyRevenueByDay = (orders) => {
    const revenueByDay = [0, 0, 0, 0, 0, 0, 0]; // T2 -> CN

    orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const day = date.getDay(); // 0 (CN) -> 6 (T7)

        // Convert: CN=0 thành 6, T2=1 thành 0, ..., T7=6 thành 5
        const index = day === 0 ? 6 : day - 1;

        revenueByDay[index] += order.totalAmount || 0;
    });

    return revenueByDay;
};

module.exports = getWeeklyRevenueByDay;
