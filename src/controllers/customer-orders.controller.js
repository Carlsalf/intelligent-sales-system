const service = require(
  "../services/customer-orders.service"
);

async function listCustomerOrders(
  req,
  res,
  next
) {
  try {
    const orders =
      await service.listOrders(
        req.customer
      );

    return res.json({
      orders,
      total: orders.length,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCustomerOrder(
  req,
  res,
  next
) {
  try {
    const order =
      await service.getOrder(
        req.customer,
        req.params.id
      );

    return res.json({
      order,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCustomerOrders,
  getCustomerOrder,
};
