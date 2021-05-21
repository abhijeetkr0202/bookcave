function successResponse(res, msg) {
	const data = {
		message: msg
	};
	return res.status(200).json(data);
};

function successResponseWithData(res, msg, data) {
	const resData = {
		message: msg,
		data: data
	};
	return res.status(200).json(resData);
};

function ModificationResponseWithData(res, msg, data) {
	const resData = {
		message: msg,
		nModified: data
	};
	return res.status(200).json(resData);
};

function successResponseWithToken(res, resData) {
	return res.status(200).json(resData);
};

function ErrorResponse(res, msg) {
	const data = {
		message: msg,
	};
	return res.status(500).json(data);
};

function notFoundResponse(res, msg) {
	const data = {
		message: msg,
	};
	return res.status(404).json(data);
};

function validationErrorWithData(res, msg, data) {
	const resData = {
		message: msg,
		data: data
	};
	return res.status(400).json(resData);
};

function unauthorizedResponse(res, msg) {
	const data = {
		message: msg,
	};
	return res.status(401).json(data);
};

module.exports = {
	successResponse,
	successResponseWithData,
	successResponseWithToken,
	ModificationResponseWithData,
	ErrorResponse,
	notFoundResponse,
	validationErrorWithData,
	unauthorizedResponse,
}