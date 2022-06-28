

const successResponse = (data, message = "success") =>{
        return {
            error: false,
            message: message,
            data: data
        }
}

const errorResponse = (message = "error", data = null) => {
    return {
        error: true,
        message: message,
        data: data
    }
}

const basicResponse = (data, message, error) => {
    return {
        error: error,
        message: message,
        data: data
    }
}

module.exports = {
    basicResponse,
    errorResponse,
    successResponse
}