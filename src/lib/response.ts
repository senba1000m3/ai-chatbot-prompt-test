export const ErrorMessage = Object.freeze({
	// 4xx
	BadRequest: "Bad request",
	Unauthorized: "Unauthorized",
	NotFound: "Not found",
	MethodNotAllowed: "Method not allowed",
	Conflict: "Conflict",
	ContentTooLarge: "Content too large",

	// 5xx
	InternalServer: "Internal server error",
	NotImplemented: "Not implemented",
});

// Types & Interfaces
export type SuccessLevel = "info" | "warning";
type JSONable =
	| string | number | boolean | null | undefined
	| readonly JSONable[]
	| { readonly [key: string]: JSONable }
	| { toJSON(): JSONable };
type BaseErrorOptions = {
	cause?: Error;
	context?: JSONable;
	status?: number;
};
type HttpErrorOptions = Omit<BaseErrorOptions, "status">;

export type Result<T = any, E extends BaseError = BaseError> =
	| { success: true; data: T; level: SuccessLevel; message: string }
	| { success: false; message: E["message"] };

export class BaseError extends Error {
	public readonly context?: JSONable;
    public status: number;

    constructor(
		message: string = ErrorMessage.InternalServer,
		options: BaseErrorOptions = {}
	) {
		const { cause, context, status } = options;

        super(message, { cause });
		this.name = new.target.name;
		this.context = context;
        this.status = status ?? 500;
    }
}



// # ------------------------- Code 4xx ------------------------------
export class BadRequestError extends BaseError {
    constructor(
		message: string = ErrorMessage.BadRequest,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 400, ...options });
        this.name = new.target.name;
    }
}
export class UnauthorizedError extends BaseError {
    constructor(
		message: string = ErrorMessage.Unauthorized,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 401, ...options });
        this.name = new.target.name;
    }
}
export class NotFoundError extends BaseError {
    constructor(
		message: string = ErrorMessage.NotFound,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 404, ...options });
        this.name = new.target.name;
    }
}
export class MethodNotAllowedError extends BaseError {
    constructor(
		message: string = ErrorMessage.MethodNotAllowed,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 405, ...options });
        this.name = new.target.name;
    }
}
export class ConflictError extends BaseError {
    constructor(
		message: string = ErrorMessage.Conflict,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 409, ...options });
        this.name = new.target.name;
    }
}
export class ContentTooLargeError extends BaseError {
	constructor(
		message: string = ErrorMessage.ContentTooLarge,
		options: HttpErrorOptions = {}
	) {
		super(message, { status: 413, ...options });
		this.name = new.target.name;
	}
}

// # ------------------------- Code 5xx ------------------------------
export class InternalServerError extends BaseError {
	constructor(
		message: string = ErrorMessage.InternalServer,
		options: HttpErrorOptions = {}
	) {
        super(message, { status: 500, ...options });
        this.name = new.target.name;
	}
}
export class NotImplementedError extends BaseError {
	constructor(
		message: string = ErrorMessage.NotImplemented,
		options: HttpErrorOptions = {}
	) {
		super(message, { status: 501, ...options });
		this.name = new.target.name;
	}
}

// # Error Handler
export function ensureError(value: unknown): BaseError {
	if (value instanceof BaseError) return value;
	if (value instanceof Error) return new InternalServerError(value.message, { cause: value });

	let stringified = "[Unable to stringify the thrown value]";
	try {
		stringified = JSON.stringify(value);
	} catch {}

	const error = new BaseError(`This value was thrown as is, not through an Error: ${stringified}`);
	return error;
}