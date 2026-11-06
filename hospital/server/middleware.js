// Логирование, единый формат ошибок и проверка данных запроса.
function requestLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`));
  next();
}
function validateBody(validator) {
  return (req, res, next) => {
    const errors = validator(req.body);
    if (errors.length) return res.status(400).json({ error: 'Проверьте данные запроса', details: errors });
    next();
  };
}
function notFound(req, res) { res.status(404).json({ error: 'Маршрут не найден' }); }
function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Внутренняя ошибка сервера' });
}
module.exports = { requestLogger, validateBody, notFound, errorHandler };
