import { NextResponse } from "next/server";

export const ErrorMessage = Object.freeze({
	// 4xx
	BadRequest: "噢不。你沒有帶行李",
	Unauthorized: "噢不。你沒有房卡",
	NotFound: "噢不。查無此房",
	MethodNotAllowed: "噢不。立入禁止",
	Conflict: "噢不。量子糾纏",
	ContentTooLarge: "噢不。行李超重",

	// 5xx
	InternalServer: "噢不。出事了阿伺",
	NotImplemented: "噢不。工程師討厭 10 種人，一種是 code 寫一半的人",
});

export const ErrorLevel = Object.freeze({
	Info: "info",
	Warning: "warning",
	Error: "error",
});



export class HttpError extends Error {
    status
	level

    constructor(message = ErrorMessage.InternalServer, status = 500, level = ErrorLevel.Error) {
        super(message);
        this.status = status;
		this.level = level;
		this.name = "HttpError";
    }
}

export function ErrorResponse(error) {
	return NextResponse.json({
		message: error.message || ErrorMessage.InternalServer,
		level: error.level || ErrorLevel.Error,
	}, { status: error.status || 500 });
}

// # ------------------------- Code 4xx ------------------------------
export class BadRequestError extends HttpError {
    constructor(message = ErrorMessage.BadRequest, status = 400, level) {
        super(message, status, level);
        this.name = "BadRequestError";
    }
}
export class UnauthorizedError extends HttpError {
    constructor(message = ErrorMessage.Unauthorized, status = 401, level) {
        super(message, status, level);
        this.name = "UnauthorizedError";
    }
}
export class NotFoundError extends HttpError {
    constructor(message = ErrorMessage.NotFound, status = 404, level) {
        super(message, status, level);
        this.name = "NotFoundError";
    }
}
export class MethodNotAllowedError extends HttpError {
    constructor(message = ErrorMessage.MethodNotAllowed, status = 405, level) {
        super(message, status, level);
        this.name = "MethodNotAllowedError";
    }
}
export class ConflictError extends HttpError {
    constructor(message = ErrorMessage.Conflict, status = 409, level) {
        super(message, status, level);
        this.name = "ConflictError";
    }
}
export class ContentTooLargeError extends HttpError {
	constructor(message = ErrorMessage.ContentTooLarge, status = 413, level) {
		super(message, status, level);
		this.name = "ContentTooLargeError";
	}
}

// # ------------------------- Code 5xx ------------------------------
export class InternalServerError extends HttpError {
	constructor(message = ErrorMessage.InternalServer, status = 500, level) {
        super(message, status, level);
        this.name = "InternalServerError";
	}
}
export class NotImplementedError extends HttpError {
	constructor(message = ErrorMessage.NotImplemented, status = 501, level) {
		super(message, status, level);
		this.name = "NotImplementedError";
	}
}