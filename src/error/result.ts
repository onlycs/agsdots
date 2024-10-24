export class Option<T> {
	private constructor(private _data: T | null) { }

	static of<T>(data: T | null | undefined): Option<T> {
		return new this(data ?? null);
	}

	static some<T>(data: T) {
		return this.of(data);
	}

	static none<T>(): Option<T> {
		return this.of<T>(null);
	}

	handle_both<U>(
		somemap: (value: T) => U,
		nonemap: () => U,
	): U {
		if (this._data) return somemap(this._data);
		else return nonemap();
	}

	is_some(): boolean {
		return this._data ? true : false;
	}

	is_none(): boolean {
		return !this.is_some();
	}

	flatten<U>(): T extends Option<U> ? T : Option<T> {
		if (this.is_none()) return Option.none() as any;
		else if (this._data instanceof Option) return this.unwrap() as any;
		else return this as any;
	}

	unwrap() {
		if (this.is_none()) throw new Error('Failed to unwrap option');
		else return this._data!;
	}

	unwrap_or(other: T) {
		if (this.is_none()) return other;
		else return this._data!;
	}

	map<U>(fn: (value: T) => U): Option<U> {
		if (this.is_none()) return Option.none();
		else return Option.some(fn(this._data!));
	}
}

export class Result<T, E extends Error> {
	_value: T | null = null;
	_error: E | null = null;

	private constructor(value: T | null, error: E | null) {
		this._value = value;
		this._error = error;
	}

	static ok<T, E extends Error>(value: T): Result<T, E> {
		return new Result<T, E>(value, null);
	}

	static err<T, E extends Error>(error: E): Result<T, E> {
		return new Result<T, E>(null, error);
	}

	static try_error<T, E extends Error>(fn: () => T, err: (e: Error) => E): Result<T, E> {
		try {
			return Result.ok(fn());
		} catch (e) {
			return Result.err(err(e as Error));
		}
	}

	static try_fn<T, E extends Error, K>(fn: (arg: K) => T, err: E): (arg: K) => Result<T, E> {
		return (arg: K) => Result.try(() => fn(arg), err);
	}

	static try_error_fn<T, E extends Error, K>(fn: (arg: K) => T, err: (e: Error) => E): (arg: K) => Result<T, E> {
		return (arg: K) => Result.try_error(() => fn(arg), err);
	}

	static try<T, E extends Error>(fn: () => T, err: E): Result<T, E> {
		try {
			return Result.ok(fn());
		} catch (_) {
			return Result.err(err);
		}
	}

	let(ok: (value: T) => void, err: (error: E) => void) {
		if (this._value) ok(this._value);
		else if (this._error) err(this._error);
	}

	map<U>(fn: (value: T) => U): Result<U, E> {
		if (this._value) return Result.ok(fn(this._value));
		else return Result.err(this._error!);
	}

	map_err<F extends Error>(fn: (error: E) => F): Result<T, F> {
		if (this._error) return Result.err(fn(this._error));
		else return Result.ok(this._value!);
	}

	with_error(fn: (error: E) => void): boolean {
		if (this._error) {
			fn(this._error);
			return true;
		}

		return false;
	}

	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		if (this._value) return fn(this._value);
		else return Result.err(this._error!);
	}

	unwrap(): T {
		if (this._value) return this._value;
		else throw this._error ?? new Error('Result is not a value');
	}

	unwrap_err(): E {
		if (this._error) return this._error;
		else throw new Error('Result is not an error');
	}

	is_ok(): boolean {
		return this._value ? true : false;
	}

	is_err() {
		return !this.is_ok();
	}

	into_option(): Option<T> {
		if (this.is_ok()) return Option.some(this.unwrap());
		else return Option.none();
	}

	handle_both<U>(
		okmap: (value: T) => U,
		emap: (err: E) => U,
	): U {
		if (this._error) return emap(this._error);
		else return okmap(this._value!);
	}
}
