import { Result } from '@result';

export class PromiseExt<T, E extends Error, R extends Result<T, E>> extends Promise<R> {
	private constructor(executor: (resolve: (value: R) => void, reject: (error: unknown) => void) => void) {
		super(executor);
	}

	static from<T, E extends Error, R extends Result<T, E>>(promise: Promise<R>) {
		return new PromiseExt<T, E, R>((resolve, reject) => {
			promise.then(resolve, reject);
		});
	}

	then_ok<U>(fn: (value: T) => U): PromiseExt<U, E, Result<U, E>> {
		return this.then(result => result.map(fn)) as PromiseExt<U, E, Result<U, E>>;
	}

	then_err<F extends Error>(fn: (error: E) => F): PromiseExt<T, F, Result<T, F>> {
		return this.then(result => result.map_err(fn)) as PromiseExt<T, F, Result<T, F>>;
	}

	catch_result(fn: (error: E) => void, panic: (paniced: unknown) => void = console.error, _finally?: () => void) {
		this.then_err((err) => {
			fn(err);
			return err;
		})
			.catch(panic)
			.finally(_finally);
	}
}

declare global {
	interface Promise<T extends Result<any, Error>> {
		into_ext(): PromiseExt<T['_value'], Exclude<T['_error'], null>, Result<T['_value'], Exclude<T['_error'], null>>>;
	}

	interface Promise<T> {
		ext<E extends Error>(err: (e: unknown) => E): PromiseExt<T, E, Result<T, E>>;
	}
}

Promise.prototype.into_ext = function () {
	return PromiseExt.from(this);
};

Promise.prototype.ext = function <T, E extends Error>(err: (e: unknown) => E): PromiseExt<T, E, Result<T, E>> {
	const promise = this.then(
		(value: T) => Result.ok<T, E>(value),
		(error: unknown) => Result.err<T, E>(err(error)),
	);

	return PromiseExt.from(promise);
};
