const service = require("../services/user-management.service");

async function list(req, res, next) {
  try {
    const data = await service.listUsers();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function roles(req, res, next) {
  try {
    const data = await service.listRoles();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.createUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const data = await service.updateStatus(req.params.id, req.body, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  roles,
  create,
  updateStatus,
};
