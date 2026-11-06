const { randomUUID } = require('node:crypto');
const store = require('./store');
const { isDate } = require('./validators');

function doctor(req, res) { res.json(store.read().doctor); }
function services(req, res) { res.json(store.read().services); }
function schedule(req, res) {
  const { date } = req.query;
  if (!isDate(date)) return res.status(400).json({ error: 'Укажите дату в формате YYYY-MM-DD' });
  const db = store.read();
  const slots = [];
  for (let hour = 9; hour < 17; hour += 1) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const appointment = db.appointments.find((item) => item.date === date && item.time === time && item.status !== 'cancelled');
      slots.push({ time, status: appointment ? 'occupied' : 'available' });
    }
  }
  res.json({ date, slots });
}
function createAppointment(req, res) {
  const db = store.read();
  if (!db.services.some((service) => service.id === req.body.serviceId)) return res.status(400).json({ error: 'Услуга не найдена' });
  if (req.body.time < '09:00' || req.body.time >= '17:00' || !['00', '30'].includes(req.body.time.slice(-2))) return res.status(400).json({ error: 'Выберите доступный слот с 09:00 до 16:30' });
  if (req.body.date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ error: 'Нельзя записаться на прошедшую дату' });
  if (db.appointments.some((item) => item.date === req.body.date && item.time === req.body.time && item.status !== 'cancelled')) return res.status(409).json({ error: 'Это время уже занято' });
  const appointment = { id: randomUUID(), patientName: req.body.patientName.trim(), phone: req.body.phone.trim(), serviceId: req.body.serviceId, date: req.body.date, time: req.body.time, status: 'confirmed', createdAt: new Date().toISOString() };
  db.appointments.push(appointment);
  store.write(db);
  res.status(201).json(appointment);
}
function reviews(req, res) {
  const db = store.read();
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const items = db.reviews.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ page, limit, total: items.length, reviews: items.slice((page - 1) * limit, page * limit) });
}
function createReview(req, res) {
  const db = store.read();
  const review = { id: randomUUID(), patientName: req.body.patientName.trim(), text: req.body.text.trim(), rating: req.body.rating, createdAt: new Date().toISOString() };
  db.reviews.push(review);
  store.write(db);
  res.status(201).json(review);
}
module.exports = { doctor, services, schedule, createAppointment, reviews, createReview };
