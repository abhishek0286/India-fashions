// const { log } = require("handlebars/runtime");
const Cart = require("../model/cartModel");

// Add/Update item in cart
exports.addOrUpdateItem = async (req, res) => {
  try {
        console.log("body", req.body)
          console.log("token", req.token._id)
    let { productId, variantId, quantity } = req.body;
    const userId = req.token._id;
    console.log("productId", productId)
    console.log("variantId", variantId)
    console.log("quantity", quantity)
    console.log("userId", userId)

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      item =>
        item.product.toString() === productId &&
        (variantId ? item.variant?.toString() === variantId : !item.variant)
    );

    if (existingItem) {
      existingItem.quantity = quantity || existingItem.quantity + 1;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId || "",
        quantity: quantity || 1
      });
    }

    await cart.save();

    res.send({
      statusCode: 200,
      success: true,
      message: "Item added/updated in cart",
      result: cart
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

// Remove item
exports.removeItem = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.token._id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          items: {
            product: productId,
            ...(variantId ? { variant: variantId } : { variant: null })
          }
        }
      },
      { new: true }
    );

    res.send({
      statusCode: 200,
      success: true,
      message: "Item removed from cart",
      result: cart
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

// Get cart (with populated products & prices)
// exports.getCart = async (req, res) => {
//   try {
//     const userId = req.token._id;

//     const cart = await Cart.findOne({ user: userId })
//       .populate({
//         path: "items.product",
//         select: "name images"
//       })
//       .populate({
//         path: "items.variant",
//         select: "color size price originalPrice"
//       })
//       .lean();

//     if (!cart) {
//       return res.send({
//         statusCode: 200,
//         success: true,
//         message: "Cart is empty",
//         result: { items: [] }
//       });
//     }

//     // Calculate totals
//     let totalPrice = 0;
//     let totalDiscount = 0;

//     cart.items.forEach(item => {
//       const price = item.variant?.price || item.product?.price || 0;
//       const originalPrice = item.variant?.originalPrice || item.product?.originalPrice || price;
//       totalPrice += price * item.quantity;
//       totalDiscount += (originalPrice - price) * item.quantity;
//     });

//     res.send({
//       statusCode: 200,
//       success: true,
//       message: "Cart fetched successfully",
//       result: {
//         ...cart,
//         totalPrice,
//         totalDiscount
//       }
//     });
//   } catch (error) {
//     res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message,
//       result: {}
//     });
//   }
// };

exports.getCart = async (req, res) => {
  try {
    const userId = req.token._id;

    const query = { user: userId };

    let { page = 1, limit = 10 } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);

    const skip = (page - 1) * limit;

    // Get user cart
    const cart = await Cart.findOne(query)
      .populate({
        path: "items.product",
        select: "name images",
      })
      .populate({
        path: "items.variant",
        select: "color size price originalPrice",
      })
      .lean();

    if (!cart) {
      return res.send({
        statusCode: 200,
        success: true,
        message: "Cart is empty",
        result: { items: [], totalPrice: 0, totalDiscount: 0, totalPages: 0 },
      });
    }

    // Apply pagination on items array
    const totalRecords = cart.items.length;
    const paginatedItems = cart.items.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalRecords / limit);

    // Calculate totals only for paginated items
    let totalPrice = 0;
    let totalDiscount = 0;

    paginatedItems.forEach((item) => {
      const price = item.variant?.price || item.product?.price || 0;
      const originalPrice =
        item.variant?.originalPrice || item.product?.originalPrice || price;

      totalPrice += price * item.quantity;
      totalDiscount += (originalPrice - price) * item.quantity;
    });

    res.send({
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully",
      result: {
        _id: cart._id,
        user: cart.user,
        items: paginatedItems,
        totalRecords,
        totalPages,
        currentPage: page,
        totalPrice,
        totalDiscount,
      },
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};
