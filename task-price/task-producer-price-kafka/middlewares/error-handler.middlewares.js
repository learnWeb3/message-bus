/**
 *
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function errorHandler(err, req, res, next) {
    const errorMessage = err.message;
    const { path } = req;
    if (err?.constructor?.name) {
        const errorType = err.constructor.name;
        switch (errorType) {
            case "ForbiddenError":
                res.status(403);
                res.json({
                    status: "error",
                    statusCode: 403,
                    statusMessage: "Forbidden",
                    message: errorMessage,
                    path,
                });
                return;
            case "UnauthorizedError":
                res.status(401);
                res.json({
                    status: "error",
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message: errorMessage,
                    path,
                });
                return;
            case "NotFoundError":
                res.status(400);
                res.json({
                    status: "error",
                    statusCode: 404,
                    statusMessage: "Not found !",
                    message: errorMessage,
                    path,
                });
                return;
            case "BadRequestError":
                res.status(400);
                res.json({
                    status: "error",
                    statusCode: 400,
                    statusMessage: "Bad request",
                    message: errorMessage,
                    path,
                });
                return;
            default:
                res.status(500);
                res.json({
                    status: "error",
                    statusCode: 500,
                    statusMessage: "Internal Server Error",
                    message: errorMessage,
                    path,
                });
                return;
        }
    } else {
        res.status(500);
        res.json({
            status: "error",
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: errorMessage,
            path,
        });
        return;
    }
}

module.exports = { errorHandler }