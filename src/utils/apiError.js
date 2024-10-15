
class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true; // To differentiate operational errors from programming errors
    }
  }
  
  export { ApiError };




// class ApiError extends Error{
//     constructor(message="Someting went wrong ", status_code,stack="", error=[]){
//         super(message);
//         this.status_code=status_code
//         this.error=error
//         this.sucess=false
//         this.data=null
//         if(stack)
//         {
//             this.stack=stack
//         }
//         else{
//             Error.captureStackTrace(this, this.constructor);
//         }
//     }
// }

// export {ApiError}