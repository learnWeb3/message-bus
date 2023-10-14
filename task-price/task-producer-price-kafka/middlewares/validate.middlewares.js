const { BadRequestError } = require("../errors");


function requireBodyParams(requiredParametersObject = {}) {
    return function (req, res, next) {
        const { body } = req;
        if (body) {
            const missingKeys = [];
            for (const key in requiredParametersObject) {
                if (!body.hasOwnProperty(key)) {
                    missingKeys.push(key);
                }
            }
            if (missingKeys.length) {
                return next(
                    new BadRequestError(
                        `Missing ${missingKeys.join(", ")} among required parameters`
                    )
                );
            }
        } else {
            return next(
                new BadRequestError(
                    `Missing ${Object.keys(requiredParametersObject).join(
                        ", "
                    )} among required parameters`
                )
            );
        }
        return next();
    };
}

function authorizeBodyParams(authorizedParametersObject = {}) {
    return function (req, res, next) {
        const { body } = req;
        if (body) {
            const errors = [];

            for (const key in body) {
                if (!authorizedParametersObject[key]) {
                    errors.push(
                        `${key} is not a valid parameter, please check api documentation`
                    );
                }
            }

            if (errors.length) {
                return next(new BadRequestError(errors.join(", ")));
            }
        }

        return next();
    };
}

function validateBodyParams(parametersValidationMapping = {}) {
    return function (req, res, next) {
        const { body } = req;
        if (body) {
            const errors = [];
            for (const key in body) {
                if (parametersValidationMapping.hasOwnProperty(key)) {
                    const { errors: parameterErrors, valid: parameterIsValid } =
                        parametersValidationMapping[key](body[key]);
                    if (!parameterIsValid) {
                        errors.push(`${key}: ${parameterErrors.join(", ")}`);
                    }
                }
            }
            if (errors.length) {
                return next(
                    new BadRequestError(`validations errors: ${errors.join(", ")}`)
                );
            }
            return next();
        }
        return next();
    };
}

module.exports = {
    validateBodyParams,
    authorizeBodyParams,
    requireBodyParams
}