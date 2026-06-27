'use strict';

const activityRepo = require('../repositories/activity.repository');
const volunteerRepo = require('../repositories/volunteer.repository');
const { getPagination } = require('../utils/pagination');
const { toDateString, toIsoString, parseDate } = require('../utils/date');
const AppError = require('../utils/AppError');

const STATUS_DB = { pending: 'PENDING', scheduled: 'SCHEDULED', completed: 'COMPLETED', cancelled: 'CANCELLED' };
const STATUS_API = { PENDING: 'pending', SCHEDULED: 'scheduled', COMPLETED: 'completed', CANCELLED: 'cancelled' };

function toActivityDto(a) {
  return {
    id: a.id,
    volunteerId: a.volunteerId,
    title: a.title,
    orgName: a.orgName,
    categoryCode: a.categoryCode,
    status: STATUS_API[a.status],
    scheduledDate: toDateString(a.scheduledDate),
    completedAt: a.completedAt ? toIsoString(a.completedAt) : null,
    hours: a.hours != null ? Number(a.hours) : null,
  };
}

// A-01
async function getList(userId, query) {
  const pagination = getPagination(query);
  const filters = {};
  if (query.status) filters.status = STATUS_DB[query.status];
  const { items, totalCount } = await activityRepo.findList(userId, filters, pagination);
  return { items: items.map(toActivityDto), totalCount };
}

// A-02
async function create(userId, { volunteerId, scheduledDate }) {
  const volunteer = await volunteerRepo.findById(volunteerId);
  if (!volunteer) throw AppError.notFound('봉사 정보를 찾을 수 없어요');
  const existing = await activityRepo.findByUserAndVolunteer(userId, volunteerId);
  if (existing && existing.status !== 'CANCELLED') {
    throw AppError.conflict('이미 신청한 봉사예요');
  }
  const date = scheduledDate ? parseDate(scheduledDate) : null;
  // 취소된 기록이 있으면 재신청을 위해 갱신
  let activity;
  if (existing && existing.status === 'CANCELLED') {
    const prisma = require('../libs/prisma');
    activity = await prisma.activity.update({
      where: { id: existing.id },
      data: { status: date ? 'SCHEDULED' : 'PENDING', scheduledDate: date, completedAt: null, hours: null },
    });
  } else {
    activity = await activityRepo.createFromVolunteer(userId, volunteer, date);
  }
  return {
    id: activity.id,
    volunteerId: activity.volunteerId,
    status: STATUS_API[activity.status],
    scheduledDate: toDateString(activity.scheduledDate),
  };
}

// A-03 complete
async function complete(userId, activityId, hours) {
  const activity = await activityRepo.findOwnedById(userId, activityId);
  if (!activity) throw AppError.notFound('활동 정보를 찾을 수 없어요');
  if (activity.status === 'COMPLETED' || activity.status === 'CANCELLED') {
    throw AppError.conflict('이미 처리된 활동이에요');
  }
  let finalHours = hours;
  if (finalHours == null && activity.volunteerId) {
    const volunteer = await volunteerRepo.findById(activity.volunteerId);
    if (volunteer && volunteer.recogHours != null) finalHours = Number(volunteer.recogHours);
  }
  const updated = await activityRepo.complete(activityId, finalHours != null ? finalHours : null);
  return {
    id: updated.id,
    status: STATUS_API[updated.status],
    completedAt: toIsoString(updated.completedAt),
    hours: updated.hours != null ? Number(updated.hours) : null,
  };
}

// A-05 cancel
async function cancel(userId, activityId) {
  const activity = await activityRepo.findOwnedById(userId, activityId);
  if (!activity) throw AppError.notFound('활동 정보를 찾을 수 없어요');
  if (activity.status === 'COMPLETED' || activity.status === 'CANCELLED') {
    throw AppError.conflict('이미 처리된 활동이에요');
  }
  const updated = await activityRepo.cancel(activityId);
  return { id: updated.id, status: STATUS_API[updated.status] };
}

// A-04 stats
async function getStats(userId) {
  return activityRepo.getStats(userId);
}

module.exports = { getList, create, complete, cancel, getStats, toActivityDto };
