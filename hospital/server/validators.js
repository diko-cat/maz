const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isDate(value) {
  if (!DATE_RE.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function appointment(body = {}) {
  const errors = [];
  if (typeof body.patientName !== 'string' || !body.patientName.trim() || body.patientName.length > 100) errors.push('patientName обязателен (до 100 символов)');
  if (typeof body.phone !== 'string' || !/^\+?[\d\s()-]{7,20}$/.test(body.phone.trim())) errors.push('Укажите корректный phone');
  if (typeof body.serviceId !== 'string' || !body.serviceId.trim()) errors.push('serviceId обязателен');
  if (!isDate(body.date)) errors.push('date должен иметь формат YYYY-MM-DD');
  if (typeof body.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) errors.push('time должен иметь формат HH:MM');
  return errors;
}
function review(body = {}) {
  const errors = [];
  if (typeof body.patientName !== 'string' || !body.patientName.trim() || body.patientName.length > 100) errors.push('patientName обязателен (до 100 символов)');
  if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 2000) errors.push('text обязателен (до 2000 символов)');
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) errors.push('rating должен быть целым числом от 1 до 5');
  return errors;
}
module.exports = { isDate, appointment, review };
