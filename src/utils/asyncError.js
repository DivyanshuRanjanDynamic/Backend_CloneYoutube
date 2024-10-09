class AsyncError extends Error{
    constructor(message="Someting went wrong ", status_code,stack="", error=[]){
        super(message);
        this.status_code=status_code
        this.error=error
        this.sucess=false
        this.data=null
        if(stack)
        {
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {AsyncError}