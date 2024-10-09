const DND = Variable(false);

const DNDManager = {
	bind: () => DND.bind(),
	get: () => DND.value,
	set: (state: boolean) => DND.setValue(state),
	switch: ({ active }: { active: boolean }) => DNDManager.set(active),
};

export default DNDManager;