const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>
    {
        Promise.resolve(requestHandler(req,res,next)).catch((error)=> next(error))
    }
}
//asyncHandler(fn-->requestHandler) is a utility function that takes an asynchronous function (fn) and returns a function that automatically catches errors and forwards them to Express’s error handler.
//It eliminates the need for manually wrapping try/catch blocks around async functions in our route handlers.
//It is a clean and efficient way to manage async errors in an Express.js application.
//  here above used functions are high order functions 


// we can write same as above code using try catch
// const asyncHandler1=(requestHandlder)=> async (req,res,next)=>
// {
//   try{
//  await requestHandlder(req,res,next)
//     }
//     catch(error){
//      res.status(error.code || 500).json(
//         {
//             message:error.message,
//             sucess:false
//         }
//      )
//     }

  
// }
export {ayncHandler}