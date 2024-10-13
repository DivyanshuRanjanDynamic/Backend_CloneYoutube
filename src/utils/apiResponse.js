 class ApiResponse{
    constructor(message,status_code,data)
    {
        this.message=message
        this.status_code=200 > status_code <400
        this.data=data
    }
 }
 export {ApiResponse}