export const Moment = {
	Time: Variable('', {
		poll: [1000, function () {
			return Utils.exec('date +"%l:%M %p"').trim();
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