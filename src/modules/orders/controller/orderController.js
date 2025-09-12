const { log } = require("handlebars");
const Product = require("../../product/model/productModel");
const Category = require("../../productCategory/model/categoryModel");
const User = require("../../user/model/userModel");
const Variant = require("../../variant/model/variantModel");
const Order = require("../model/orderModel");
const { success } = require("../../../utils/ResponseHandler");


function generateTransactionId(prefix = "TXN") {
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); // 10 digit number
  return prefix + randomNumber.toString();
}

const transactionId = generateTransactionId("TXN"); 
console.log(transactionId);



exports.placeOrder = async (req,res) =>{
try {
  const token =  req.token
  const {productId,variantId,categoryId,quantity,shippingAddress,paymentMethod,paymentStatus,productstatus}= req.body
 
  if (!productId) {
    return res.send({
      statusCode:400,
      success:false,
      message:"Product Id is required",
      result:{}
    })
  }
    if (!variantId) {
    return res.send({
      statusCode:400,
      success:false,
      message:"variant Id is required",
      result:{}
    })
  }
  if (!categoryId) {
    return res.send({
      statusCode:400,
      success:false,
      message:"category Id is required",
      result:{}
    })
  }
    if (!quantity) {
    return res.send({
      statusCode:400,
      success:false,
      message:"quantity is required",
      result:{}
    })
  }
     if (!shippingAddress) {
    return res.send({
      statusCode:400,
      success:false,
      message:"shipping Address is required",
      result:{}
    })
  }
     if (!paymentMethod) {
    return res.send({
      statusCode:400,
      success:false,
      message:"payment Method is required",
      result:{}
    })
  }
  const user = await User.findOne({_id:token._id,status:"Active"})
  if (!user) {
    return res.send({
      statuaCode:404,
      success:false,
      message:"Unautorized access",
      result:{}
    })
  }
  const product = await Product.findOne({_id:productId,status:"Active"})
  if (!product) {
    return res.send({
      statusCode:404,
      success:false,
      message:"The product you are selected is not found",
      result:{}
    })
  }
   const category = await Category.findOne({_id:categoryId,status:"Active"})
  if (!category) {
    return res.send({
      statusCode:404,
      success:false,
      message:"Invalid category",
      result:{}
    })
  }
    const verientCheck = await Variant.findOne({_id:variantId,status:"Active"})
  if (!verientCheck) {
    return res.send({
      statusCode:404,
      success:false,
      message:"Invalid Variant",
      result:{}
    })
  }

  if (!verientCheck.stock || verientCheck.stock <= 0) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "This variant is out of stock",
    result: {}
  });
}

if (verientCheck.stock < quantity) {
  return res.send({
    statusCode: 400,
    success: false,
    message: `Only ${verientCheck.stock} items are available in stock`,
    result: {}
  });
}
  const orderNumber = await Order.countDocuments();
  console.log("orderNumber",orderNumber);
  

  let verientPrice = verientCheck.originalPrice*quantity
  const shippingFee = 10  // add dynamic shiping fee here its come from admin panel 
  const GSTAmount = 18 //   add dynamic GSTAmount here its come from admin panel
  console.log("verinet price with  quantity",verientPrice);
  
  const NewGSTAmount = verientPrice*GSTAmount/100
//  console.log("GST with  quantity",NewGSTAmount);

  if (shippingFee>0) {
    console.log("shipingfee",shippingFee);
    
    verientPrice = verientPrice+shippingFee
     console.log("agr shiping price zero se jyada hai to ",verientPrice);
  }

   let payableAmount = verientPrice + NewGSTAmount;
    // console.log("final amount",payableAmount,"verinty price",verientPrice,"gsygygsdhs",NewGSTAmount);
const transactionId = generateTransactionId("TXN");

  const planeNewOrder = new Order({
    user:user._id,
    orderNumber:orderNumber+1,
    items:[
      {
        product:productId,
        variant:variantId,
        categoryId:categoryId,
        quantity:quantity,
        price:verientCheck.originalPrice
      }
    ],
    status:productstatus,
    shippingFee,
    GSTAmount:NewGSTAmount,
    totalAmount:payableAmount,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod==="Cash On Delivery"?"Pending":paymentStatus,
    // deliveredAt:Date.now()
    transactionId,
  })
  
  await planeNewOrder.save();
 if (planeNewOrder){

   verientCheck.stock -= quantity;
  await verientCheck.save();

  return res.send({
    statusCode:200,
    success:true,
    message:"Order place successfully",
    result:{planeNewOrder} 
  })
 }
else{
  return res.send({
    statusCode:404,
    success: false,
    message:"There are some issue to place an order please try again letter",
    result:{}
  })
}

} catch (error) {
  console.log("error!",error);
  return res.send({
    statusCode:500,
    success:false,
    message:error.message||"Internal server error",
    result:{error}
  })
  
}
}

// exports.getMyOrders = async (req, res) => {
//   try {
//     const userId = req.token._id; // from verifyJWT
//     const { page = 1, limit = 10, search = "" } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const filter = { user: userId };
//     if (search) {
//       filter.$or = [
//         { orderId: { $regex: search, $options: "i" } },
//         { status: { $regex: search, $options: "i" } },
//       ];
//     }

//     const totalOrders = await Order.countDocuments(filter);

//     const orders = await Order.find(filter)
//       .select("orderId status totalAmount createdAt items")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     // Format response
//     const formattedOrders = orders.map((order) => ({
//       _id: order._id,
//       orderId: order.orderId,
//       status: order.status,
//       totalAmount: order.totalAmount,
//       itemsCount: order.items.length,
//       createdAt: order.createdAt,
//     }));

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "Orders fetched successfully",
//       result: {
//         data: formattedOrders,
//         totalPages: Math.ceil(totalOrders / parseInt(limit)),
//         totalRecords: totalOrders,
//         currentPage: parseInt(page),
//       },
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message || "Server error",
//       result: {},
//     });
//   }
// };


exports.getMyOrders = async (req,res) =>{

  try {
    let token = req.token
    let {page=1, limit=10,search=""}=req.query
    page=Number.parseInt(page)
    limit = Number.parseInt(limit)
    let skip = (page - 1) * limit;

    let user = await User.findOne({_id:token._id,status:"Active"})
    if (!user) {
      return res.send({
        statusCode:404,
        success:false,
        message:"Unauthorized acccess",
        result:{}
      })
    }
    let allOrder = await Order.find({user:user._id}).skip(skip).limit(limit).populate({path:"items.product",select:"name images price originalPrice"}).populate({path:"items.variant",select:"color size price originalPrice"}).populate({path:"items.categoryId",select:"image name slug"})
    if(!allOrder){
      return res.send({
        statusCode:404,
        success:false,
        message:"Opss! No Order list found",
        result:{}
      })
    }
   let totalOrder = await Order.countDocuments();
    return res.send({
      statusCode: 200,
      success: true,
      message: "All Order fetch successfully",
      result: {
        Orders: allOrder,
        currentPage: page,
        totalPage: Math.ceil(totalOrder / limit),
        totalRecord: totalOrder,
      },
    });
  } catch (error) {
    console.log("Error!!",error);
    
    return res.send({
      statusCode:500,
      success:false,
      message:error.message||"Internal server error",
      result:{}
    })
  }
}

exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "items.product",
        select: "name images price originalPrice",
      })
      .populate({
        path: "items.variant",
        select: "color size price originalPrice",
      })
      .lean();

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order detail fetched successfully",
      result: order,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Server error",
      result: {},
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: `Order cannot be cancelled once ${order.status}`,
        result: {},
      });
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order cancelled successfully",
      result: order,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Server error",
      result: {},
    });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    if (order.status !== "Delivered") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Only delivered orders can be returned",
        result: {},
      });
    }

    order.status = "Returned";
    order.returnReason = reason || "No reason provided";
    order.returnedAt = new Date();
    await order.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order returned successfully",
      result: order,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Server error",
      result: {},
    });
  }
};

exports.getPendingDeliveredData = async (req, res) => {
  try {
    let token = req.token;
    let { tabId } = req.params;
    // let { page = 1, limit = 10 } = req.query;

    // page = Number.parseInt(page);
    // limit = Number.parseInt(limit);
    // let skip = (page - 1) * limit;
   tabId = Number.parseInt(tabId)
    

    let user = await User.findOne({ _id: token._id, status: "Active" });
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    // ✅ build filter
    // let statusFilter = {};
    // if (tabId == 1) {
    //   statusFilter = { status: "Pending" };
    // } else if (tabId == 2) {
    //   statusFilter = { status: "Delivered" };
    // }

    // // ✅ fetch orders
    // let allOrder = await Order.find({ user: user._id, ...statusFilter })
    //   .skip(skip)
    //   .limit(limit)
    //   .populate({ path: "items.product", select: "name images price originalPrice" })
    //   .populate({ path: "items.variant", select: "color size price originalPrice" })
    //   .populate({ path: "items.categoryId", select: "image name slug" });

    // if (!allOrder || allOrder.length === 0) {
    //   return res.send({
    //     statusCode: 404,
    //     success: false,
    //     message: "Oops! No Order list found",
    //     result: {},
    //   });
    // }

    // // ✅ total count (with same filter)
    // let totalOrder = await Order.countDocuments({ user: user._id, ...statusFilter });

    // return res.send({
    //   statusCode: 200,
    //   success: true,
    //   message: tabId == 1 ? "Pending orders fetched" : "Delivered orders fetched",
    //   result: {
    //     Orders: allOrder,
    //     currentPage: page,
    //     totalPage: Math.ceil(totalOrder / limit),
    //     totalRecord: totalOrder,
    //   },
    // });
if (tabId == 1) {
  let allOrder = await Order.find({ user: user._id, status:"Pending" })
      // .skip(skip)
      // .limit(limit)
      .populate({ path: "items.product", select: "name images price originalPrice" })
      .populate({ path: "items.variant", select: "color size price originalPrice" })
      .populate({ path: "items.categoryId", select: "image name slug" });

      console.log("penidnfjnj",allOrder);
      
   
      if (!allOrder || allOrder.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Oops! No Order list found",
        result: {},
      });
    }
    return res.send({
      statusCode:200,
      success:true,
      message:"Pending order fetch successfully",
      result:{
        allOrder
      }
    })
}

if (tabId == 2) {
  let allOrder = await Order.find({ user: user._id, status:"Delivered" })
      // .skip(skip)
      // .limit(limit)
      .populate({ path: "items.product", select: "name images price originalPrice" })
      .populate({ path: "items.variant", select: "color size price originalPrice" })
      .populate({ path: "items.categoryId", select: "image name slug" });
   
      if (!allOrder || allOrder.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Oops! No Order list found",
        result: {},
      });
    }
    return res.send({
      statusCode:200,
      success:true,
      message:"Delivered order fetch successfully",
      result:{
        allOrder
      }
    })
}

  } catch (error) {
    console.log("Error!!", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      result: {},
    });
  }
};

