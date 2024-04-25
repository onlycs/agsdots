export const Moment = {
	Time: Variable('', {
		poll: [1000, function () {
			return Utils.exec('date +%l:%M:%S %P').trim();
		}],
	}),
	Date: Variable('', {
		poll: [1000, function () {
			return Utils.exec('date +"%A, %b %d"').trim();
		}],
	}),
	DateNumbers: Variable('', {
		poll: [1000, function () {
			return Utils.exec('date +"%m/%d/%Y"').trim();
		}],
	}),
};