const service = require("../services/analytics.service");

async function summary(req, res, next) {
  try {
    const data = await service.getSummary();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
