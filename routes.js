const userRouter = require("./src/modules/user/routes/userRoute");
const adminRouter = require("./src/modules/admin/routes/adminRoute");
const notificationRouter = require("./src/modules/notifications/routes/notificationRoute");
const bannerRouter = require("./src/modules/banner/routes/bannerRoute");
const termRouter = require("./src/modules/tncs/routes/tncRoute");
const policyRouter = require("./src/modules/privacyPolicy/routes/policyRoute");
const cartRouter = require("./src/modules/cart/routes/cartRoutes");
const homeSectionRouter = require("./src/modules/homeSection/routes/homeSectionRoutes");
const orderRouter = require("./src/modules/orders/routes/orderRoutes");
const productRouter = require("./src/modules/product/routes/productRoutes");
const productCategoryRouter = require("./src/modules/productCategory/routes/categoryRoutes");
const reviewRouter = require("./src/modules/review/routes/reviewRoutes");
const variantRouter = require("./src/modules/variant/routes/variantRoutes");
const wishlistRouter = require("./src/modules/wishlist/routes/wishlistRoutes");

module.exports = [
  {
    path: "/user",
    handler: userRouter,
    schema: "User",
  },
  {
    path: "/admin",
    handler: adminRouter,
    schema: "Admin",
  },
  {
    path: "/notification",
    handler: notificationRouter,
    schema: "Notification",
  },
  {
    path: "/banner",
    handler: bannerRouter,
    schema: "Banner",
  },
  {
    path: "/cart",
    handler: cartRouter,
    schema: "Cart",
  },
  {
    path: "/order",
    handler: orderRouter,
    schema: "Order",
  },
  {
    path: "/product",
    handler: productRouter,
    schema: "Product",
  },
  {
    path: "/variant",
    handler: variantRouter,
    schema: "Variant",
  },
  {
    path: "/category",
    handler: productCategoryRouter,
    schema: "Category",
  },
  {
    path: "/review",
    handler: reviewRouter,
    schema: "Review",
  },
  {
    path: "/wishlist",
    handler: wishlistRouter,
    schema: "Wishlist",
  },
  {
    path: "/home-section",
    handler: homeSectionRouter,
    schema: "HomeSection",
  },
  {
    path: "/tnc",
    handler: termRouter,
    schema: "tnc",
  },
  {
    path: "/policy",
    handler: policyRouter,
    schema: "Policy",
  },
];
