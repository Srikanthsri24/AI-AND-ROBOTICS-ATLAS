// Browser-only simulation with fictional data. Real deployments need server-side authorization.
const statuses = ['New', 'Contacted', 'Visit booked', 'Enrolled'];
export const permissions = {
  admin: { roster: 'School roster', attendance: true, admissions: true },
  teacher: { roster: 'Assigned class', attendance: true, admissions: false },
  student: { roster: 'Own record', attendance: false, admissions: false },
};

export function createSession(state, schoolId, role) {
  const school = state.schools.find(record => record.id === schoolId);
  if (!school || !Object.hasOwn(permissions, role)) throw new Error('Choose a demo school and role.');
  const representative = state.learners.find(learner => learner.schoolId === schoolId);
  if (!representative) throw new Error('The school has no demonstration roster.');
  return { schoolId, role, group: representative.group, learnerId: representative.id };
}

export function scopeRecords(state, session) {
  const withinSchool = state.learners.filter(learner => learner.schoolId === session.schoolId);
  const learners = session.role === 'admin' ? withinSchool
    : session.role === 'teacher' ? withinSchool.filter(learner => learner.group === session.group)
    : withinSchool.filter(learner => learner.id === session.learnerId);
  const inquiries = session.role === 'admin'
    ? state.inquiries.filter(inquiry => inquiry.schoolId === session.schoolId)
    : [];
  return { learners, inquiries };
}

export function setAttendance(state, session, id, attendance) {
  if (!['admin', 'teacher'].includes(session.role)
      || !['Present', 'Absent'].includes(attendance)
      || !scopeRecords(state, session).learners.some(learner => learner.id === id)) {
    throw new Error('This role cannot update that attendance record.');
  }
  return {
    ...state,
    learners: state.learners.map(learner => learner.schoolId === session.schoolId && learner.id === id
      ? { ...learner, attendance } : learner),
  };
}

export function advanceInquiry(state, session, id) {
  const inquiry = scopeRecords(state, session).inquiries.find(record => record.id === id);
  const index = inquiry ? statuses.indexOf(inquiry.status) : -1;
  if (index < 0 || index === statuses.length - 1) throw new Error('This inquiry cannot advance.');
  return {
    ...state,
    inquiries: state.inquiries.map(record => record.schoolId === session.schoolId && record.id === id
      ? { ...record, status: statuses[index + 1] } : record),
  };
}
