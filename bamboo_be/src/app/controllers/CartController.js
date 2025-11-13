const CampaignProducts = require('../models/CampaignProducts');
const Carts = require('../models/Carts');
const Products = require('../models/Products');

class CartController {
    //API - Frontend
    //[GET] /cart/:userId
    async getCart(req, res, next) {
        try {
            const userId = req.params.userId;
            const cart = await Carts.findOne({ userId }).lean();
            if (!cart)
                return res.json({
                    message: 'Giỏ hàng của bạn rỗng!',
                    items: [],
                });
            res.json(cart);
        } catch (error) {
            next(error);
        }
    }

    //[POST] /cart/store
    async addToCart(req, res, next) {
        try {
            const { userId, productId, quantity = 1, sizeIds = [], colorIds = [] } = req.body;

            const now = new Date();

            const product = await Products.findById(productId);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

            const campaigns = await CampaignProducts.find({
                productId: { $in: productId },
            }).populate({
                path: 'campaignId',
                match: {
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                },
            });
            const activeCampaigns = campaigns.filter((c) => c.campaignId);
            let salePrice = product.price;
            if (activeCampaigns.length > 0) {
                salePrice = Math.min(...activeCampaigns.map((c) => c.salePrice));
            }

            const unitPrice = salePrice ? salePrice : product.price;
            let cart = await Carts.findOne({ userId });
            if (!cart) cart = await Carts.create({ userId, items: [] });

            //Kiểm tra item tồn tại trong giỏ chưa
            const existingIndex = cart.items.findIndex(
                (item) =>
                    item.productId.toString() === productId.toString() &&
                    JSON.stringify(item.sizeIds) === JSON.stringify(sizeIds) &&
                    JSON.stringify(item.colorIds) === JSON.stringify(colorIds),
            );

            if (existingIndex > -1) {
                //Nếu có thì + số lượng
                cart.items[existingIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productId,
                    quantity,
                    unitPrice,
                    price: product.price,
                    sizeIds,
                    colorIds,
                });
            }

            await cart.save();
            res.json(cart);
        } catch (error) {
            next(error);
        }
    }

    //[PUT] /cart/update
    async updateItemCart(req, res, next) {
        try {
            const { userId, itemId, quantity } = req.body;

            const cart = await Carts.findOne({ userId });

            if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng!!' });

            const item = cart.items.id(itemId);

            if (!item) return res.status(404).json({ message: 'Sản phẩm không tồn tại!!' });

            item.quantity = quantity;
            await cart.save();
            res.json(cart);
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /cart/delete
    async removeItemCart(req, res, next) {
        try {
            const { userId, itemId } = req.body;

            const cart = await Carts.findOne({ userId });

            if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng!!' });

            cart.items.id(itemId).remove();
            await cart.save();
            res.json(cart);
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /cart/delete/force
    async clearCart(req, res, next) {
        try {
            const { userId } = req.body;
            const cart = await Carts.findOne({ userId });
            if (!cart) return res.json({ message: 'Giỏ hàng rỗng!!' });

            cart.items = [];
            await cart.save();
            res.json({ message: 'Đã xóa tất cả sản phẩm trong giỏ hàng!!' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();
