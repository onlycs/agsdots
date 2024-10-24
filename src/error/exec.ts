export class ExecError extends Error {
	constructor(_: unknown) {
		super('Command failed to execute');
		this.name = 'ExecError';
	}

	static convert(other: unknown): ExecError {
		return new ExecError(other);
	}
}
