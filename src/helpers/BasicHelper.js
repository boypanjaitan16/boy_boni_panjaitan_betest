exports.responseSuccess = (res, data = [], status = 200) => {
    return res.status(status).json(data)
}

exports.responseError = (res, err, code = 403) => {
    return res.status(code).json({
        code,
        message : err.message
    })
}

exports.responseFailed = (res, errors, code = 403) => {
    const message   = errors[0]?.msg;

    return res.status(403).json({
        code,
        message,
        errors
    })
}