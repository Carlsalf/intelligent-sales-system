const service = require(
  "../services/customer-address.service"
);

async function listCustomerAddresses(
  req,
  res,
  next
) {
  try {
    const addresses = await service.listAddresses(
      req.customer.id_cliente
    );

    return res.json({
      addresses,
      total: addresses.length,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCustomerAddress(
  req,
  res,
  next
) {
  try {
    const address = await service.getAddress(
      req.customer.id_cliente,
      req.params.id_direccion
    );

    return res.json({ address });
  } catch (error) {
    return next(error);
  }
}

async function createCustomerAddress(
  req,
  res,
  next
) {
  try {
    const address = await service.createAddress(
      req.customer.id_cliente,
      req.body || {}
    );

    return res.status(201).json({
      message: "Dirección registrada correctamente",
      address,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCustomerAddress(
  req,
  res,
  next
) {
  try {
    const address = await service.updateAddress(
      req.customer.id_cliente,
      req.params.id_direccion,
      req.body || {}
    );

    return res.json({
      message: "Dirección actualizada correctamente",
      address,
    });
  } catch (error) {
    return next(error);
  }
}

async function setDefaultCustomerAddress(
  req,
  res,
  next
) {
  try {
    const address =
      await service.setDefaultAddress(
        req.customer.id_cliente,
        req.params.id_direccion
      );

    return res.json({
      message:
        "Dirección principal actualizada correctamente",
      address,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteCustomerAddress(
  req,
  res,
  next
) {
  try {
    const result = await service.deleteAddress(
      req.customer.id_cliente,
      req.params.id_direccion
    );

    return res.json({
      message:
        "Dirección desactivada correctamente",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCustomerAddresses,
  getCustomerAddress,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
};
