import Active from '@bar/workspace/active';
import Available from '@bar/workspace/indicator';

import { Hoverable } from '@prelude';

export default Hoverable(Widget.Box({
	vertical: true,
	children: [Active, Available],
	class_name: 'BarElement WorkspaceBox',
	homogeneous: true,
}));