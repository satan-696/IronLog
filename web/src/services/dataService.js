// web/src/services/dataService.js
// Web always uses API — no SQLite. Same interface shape as app's dataService.
import api from '../config/api.js';

const DataService = {
  // ── Auth ─────────────────────────────────────────────────
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  async verifyToken() {
    const res = await api.get('/auth/verify');
    return res.data;
  },

  // ── User ─────────────────────────────────────────────────
  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },
  async updateMe(data) {
    const res = await api.put('/users/me', data);
    return res.data;
  },
  async deleteMe() {
    await api.delete('/users/me');
  },

  // ── Schedule ─────────────────────────────────────────────
  async getSchedule() {
    const res = await api.get('/schedules');
    return res.data;
  },
  async saveScheduleDay(dayIndex, type, muscleGroups) {
    const res = await api.put(`/schedules/${dayIndex}`, { type, muscleGroups });
    return res.data;
  },
  async applyPresetSplit(splitId) {
    const res = await api.post('/schedules/apply-split', { splitId });
    return res.data;
  },

  // ── Exercises ────────────────────────────────────────────
  async getExercises(scheduleId) {
    const res = await api.get(`/exercises/${scheduleId}`);
    return res.data;
  },
  async addExercise(data) {
    const res = await api.post('/exercises', data);
    return res.data;
  },
  async updateExercise(id, data) {
    const res = await api.put(`/exercises/${id}`, data);
    return res.data;
  },
  async deleteExercise(id) {
    await api.delete(`/exercises/${id}`);
  },
  async reorderExercises(exerciseIds) {
    const res = await api.put('/exercises/reorder', { exerciseIds });
    return res.data;
  },

  // ── Custom Exercise Library ──────────────────────────────
  async getCustomExercises() {
    const res = await api.get('/custom-exercises');
    return res.data;
  },
  async addCustomExercise(data) {
    const res = await api.post('/custom-exercises', data);
    return res.data;
  },
  async deleteCustomExercise(id) {
    await api.delete(`/custom-exercises/${id}`);
  },

  // ── Workout Logs ─────────────────────────────────────────
  async getWeekLogs(weekKey, dayIndex) {
    const params = dayIndex !== undefined ? `?dayIndex=${dayIndex}` : '';
    const res = await api.get(`/workout-logs/week/${weekKey}${params}`);
    return res.data;
  },
  async getMonthLogs(year, month) {
    const res = await api.get(`/workout-logs/month/${year}/${month}`);
    return res.data;
  },
  async saveSet(data) {
    const res = await api.post('/workout-logs', data);
    return res.data;
  },
  async deleteSet(id) {
    await api.delete(`/workout-logs/${id}`);
  },

  // ── Meal Logs ────────────────────────────────────────────
  async getMealsForDay(dateKey) {
    const res = await api.get(`/meal-logs/${dateKey}`);
    return res.data;
  },
  async getDailyTotals(dateKey) {
    const res = await api.get(`/meal-logs/totals/${dateKey}`);
    return res.data;
  },
  async addFood(data) {
    const res = await api.post('/meal-logs', data);
    return res.data;
  },
  async deleteFood(id) {
    await api.delete(`/meal-logs/${id}`);
  },

  // ── Weight Logs ──────────────────────────────────────────
  async getWeightLogs() {
    const res = await api.get('/weight-logs');
    return res.data;
  },
  async saveWeightLog(weightKg, dateKey) {
    const res = await api.post('/weight-logs', { weightKg, dateKey });
    return res.data;
  },
  async deleteWeightLog(id) {
    await api.delete(`/weight-logs/${id}`);
  },
};

export default DataService;
