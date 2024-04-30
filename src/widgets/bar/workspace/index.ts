import Active from '@bar/workspace/active';
import Indicator from '@bar/workspace/indicator';

import { Hoverable } from '@prelude';

export default Hoverable(Widget.Box({
	vertical: true,
	children: [Active, Indicator],
	class_name: 'BarElement ExtraPadding',
	homogeneous: true,
}));