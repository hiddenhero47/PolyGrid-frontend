// Small pure helpers shared by the job pages.

const idOf = (value) => String(value?._id || value?.id || value || '');

// 'client' | 'provider' | null for the signed-in user
export const myRoleIn = (job, userId) => {
	if (!job || !userId) return null;
	if (idOf(job.client?.userId) === String(userId)) return 'client';
	if (idOf(job.provider?.userId) === String(userId)) return 'provider';
	return null;
};

export const otherRole = (role) => (role === 'client' ? 'provider' : 'client');

// A party's display name: the backend's user summary when it sends one,
// else the role.
export const partyName = (job, role, myRole) => {
	if (role === myRole) return 'You';
	const party = job?.[role] || {};
	const user =
		party.user || (typeof party.userId === 'object' ? party.userId : null);
	return user?.fullName || (role === 'client' ? 'The client' : 'The provider');
};

export const partyUser = (job, role) => {
	const party = job?.[role] || {};
	return party.user || (typeof party.userId === 'object' ? party.userId : null);
};

// stage share in money
export const stageAmount = (job, stage) =>
	((job?.totalAmount || 0) * (stage?.payment || 0)) / 100;

export const stagesTotal = (stages = []) =>
	stages.reduce((sum, s) => sum + (Number(s.payment) || 0), 0);
