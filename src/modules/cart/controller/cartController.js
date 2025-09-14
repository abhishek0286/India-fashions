// const { log } = require("handlebars/runtime");
const Cart = require("../model/cartModel");
const User = require("../../user/model/userModel")

// Add/Update item in cart

// exports.addOrUpdateItem = async (req, res) => {
//   try {
//     let { productId, variantId, categoryId, quantity } = req.body;
//     const userId = req.token._id;

//     console.log("productId", productId);
//     console.log("variantId", variantId);
//     console.log("categoryId", categoryId);
//     console.log("quantity", quantity);
//     console.log("userId", userId);

//     // Input validation
//     if (!productId) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Product ID is required",
//         result: {}
//       });
//     }

//     if (!categoryId) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Category ID is required",
//         result: {}
//       });
//     }

//     // Ensure valid quantity
//     quantity = parseInt(quantity) || 1;

//     // Find or create cart
//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     // Find existing item (product + category + variant check)
//     const existingItem = cart.items.find(item => {
//       const productMatch = item.product?.toString() === productId;
//       const categoryMatch = item.categoryId?.toString() === categoryId;

//       if (variantId) {
//         return (
//           productMatch &&
//           categoryMatch &&
//           item.variant?.toString() === variantId
//         );
//       } else {
//         return productMatch && categoryMatch && !item.variant;
//       }
//     });

//     if (existingItem) {
//       // Update quantity
//       existingItem.quantity = quantity || existingItem.quantity + 1;
//     } else {
//       // Add new item
//       const newItem = {
//         product: productId,
//         categoryId: categoryId,
//         quantity: quantity
//       };
//       if (variantId) {
//         newItem.variant = variantId;
//       }
//       cart.items.push(newItem);
//     }

//     await cart.save();

//     res.send({
//       statusCode: 200,
//       success: true,
//       message: "Item added/updated in cart",
//       result: cart
//     });
//   } catch (error) {
//     console.error("Cart API Error:", error);
//     res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message,
//       result: {}
//     });
//   }
// };


// exports.addOrUpdateItem = async (req, res) => {
//   try {
    
//     let { productId, variantId, quantity } = req.body;
//     quantity = parseInt(quantity);
//     const userId = req.token._id;
    
//     console.log("productId", productId)
//     console.log("variantId", variantId)
//     console.log("quantity", quantity)
//     console.log("userId", userId)

//     // Input validation
//     if (!productId) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Product ID is required",
//         result: {}
//       });
//     }

//     let cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     const existingItem = cart.items.find(item => {
//       // Safe comparison with null checks
//       const productMatch = item.product && item.product.toString() === productId;
      
//       if (variantId) {
//         // If variantId is provided, check if variant exists and matches
//         return productMatch && item.variant && item.variant.toString() === variantId;
//       } else {
//         // If no variantId provided, find item with no variant or empty variant
//         return productMatch && (!item.variant || item.variant === "");
//       }
//     });

//     if (existingItem) {
//       // Update quantity if item exists
//       existingItem.quantity = quantity || existingItem.quantity + 1;
//     } else {
//       // Add new item to cart
//       const newItem = {
//         product: productId,
//         quantity: quantity || 1
//       };
      
//       // Only add variant if it's provided
//       if (variantId) {
//         newItem.variant = variantId;
//       }
      
//       cart.items.push(newItem);
//     }

//     await cart.save();

//     res.send({
//       statusCode: 200,
//       success: true,
//       message: "Item added/updated in cart",
//       result: cart
//     });
//   } catch (error) {
//     console.error("Cart API Error:", error);
//     res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message,
//       result: {}
//     });
//   }
// };

exports.addItems = async (req, res) => {
  try {
    let { productId, variantId, categoryId, quantity } = req.body;
    quantity = parseInt(quantity);
    const userId = req.token._id;

    if (!productId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Product ID is required",
        result: {}
      });
    }
    if (!variantId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Variant ID is required",
        result: {}
      });
    }
    if (!categoryId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Category ID is required",
        result: {}
      });
    }
    if (!quantity) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Quantity is required",
        result: {}
      });
    }

    // User check
    const user = await User.findOne({ _id: userId, status: "Active" });
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {}
      });
    }

    // Cart check
    let cart = await Cart.findOne({ user: userId, status: "Active" });

    if (!cart) {
      // Agar user ke liye koi cart nahi hai to naya banado
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            variant: variantId,
            categoryId: categoryId,
            quantity: quantity
          }
        ]
      });
      await cart.save();
      return res.send({
        statusCode: 200,
        success: true,
        message: "Cart created and item added successfully",
        result: cart
      });
    } else {
      // Agar cart hai to check karo item already exist karta hai ya nahi
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId &&
          item.categoryId.toString() === categoryId
      );

      if (itemIndex > -1) {
        // Item already exist
        return res.send({
          statusCode: 400,
          success: false,
          message: "This product with variant and category already exists in cart",
          result: {}
        });
      } else {
        // Naya item add karo
        cart.items.push({
          product: productId,
          variant: variantId,
          categoryId: categoryId,
          quantity: quantity
        });
        await cart.save();
        return res.send({
          statusCode: 200,
          success: true,
          message: "Item added successfully",
          result: cart
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: {}
    });
  }
};

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

    const user = await User.findOne({_id:userId,status:"Active"})
    if (!user) {
      return res.send({
        statusCode:404,
        success:false,
        message:"Unauthorized user",
        result:{}
      })
    }
console.log("user",user)
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
       user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            addresses: user.addresses || [],
          },
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
