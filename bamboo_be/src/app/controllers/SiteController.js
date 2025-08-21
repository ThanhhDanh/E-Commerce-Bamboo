const Product = require('../models/Products');
const User = require('../models/Users');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const Orders = require('../models/Orders');
const getChangeStats = require('../../util/getChangeStats');
const getWeeklyRevenueByDay = require('../../util/getWeeklyRevenueByDay');

class SiteController {
    //[GET] /home
    home(req, res) {
        if (!req.session.user) {
            return res.redirect('/');
        }

        const now = new Date();

        // Tuần này
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Tuần trước
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const endOfLastWeek = new Date(endOfWeek);
        endOfLastWeek.setDate(endOfWeek.getDate() - 7);

        Promise.all([
            // Orders tuần này và tuần trước
            Orders.find({ createdAt: { $gte: startOfWeek, $lte: endOfWeek } }),
            Orders.find({ createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } }),
            // Users đăng ký tuần này và tuần trước
            User.find({ role: 'user', createdAt: { $gte: startOfWeek, $lte: endOfWeek } }),
            User.find({ role: 'user', createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } }),
            User.find({ role: 'user' }).sort('-createdAt'),
        ])
            .then(([ordersThisWeek, ordersLastWeek, usersThisWeek, usersLastWeek, AllUsers]) => {
                const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const revenueLastWeek = ordersLastWeek.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

                const countOrdersThisWeek = ordersThisWeek.length;
                const countOrdersLastWeek = ordersLastWeek.length;

                const countCustomersThisWeek = usersThisWeek.length;
                const countCustomersLastWeek = usersLastWeek.length;

                const revenueStats = getChangeStats(revenueThisWeek, revenueLastWeek);
                const orderStats = getChangeStats(countOrdersThisWeek, countOrdersLastWeek);
                const customerStats = getChangeStats(countCustomersThisWeek, countCustomersLastWeek);

                const weeklyRevenue = getWeeklyRevenueByDay(ordersThisWeek);

                res.render('home', {
                    user: req.session.user,
                    totalRevenue: revenueThisWeek,
                    countOrders: countOrdersThisWeek,
                    countCustomers: countCustomersThisWeek,
                    revenueStats,
                    orderStats,
                    customerStats,
                    weeklyRevenueJSON: JSON.stringify(weeklyRevenue),
                    AllUsers: mutipleMongooseToObject(AllUsers),
                });
            })
            .catch((err) => console.log(err));
    }

    // [GET] /search
    search(req, res) {
        res.render('search');
    }
}

module.exports = new SiteController();
