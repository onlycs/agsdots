import Active from '@bar/workspace/active';
import Available from '@bar/workspace/indicator';

import Interactable from '@components/interactable';

export default Interactable({ 
	child: Widget.Box({
		vertical: true,
		children: [Active, Available],
		class_name: 'BarElement WorkspaceBox',
		homogeneous: true,
	}) 
});