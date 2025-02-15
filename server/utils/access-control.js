const user=require("../db/models/users");
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv").config();
const {success_function,error_function}=require("./response-handler");
const control_data=require("./control-data.json");
const users = require("../db/models/users");


exports.accessControl= async function (access_types,req,res,next) {
    try{
        console.log(access_types);

        if (access_types==="*"){
            return next();
        }

        const auth_header=req.headers['authorization'];
        console.log(auth_header);

        if(!auth_header){
            let response=error_function({
                statusCode:400,
                message:"please login "
            });
            return res.status(response.statusCode).send (response);
        }
        const token =auth_header.split(" ")[1];
        console.log(token);

        if(!token||token==='null'||token==='undefined'){
            let response=error_function({
                statusCode:400,
                message:"invalid access token"
            });
            return res.status(response.statusCode).send(response);
        }

        jwt.verify(token,process.env.PRIVATE_KEY,async function (err,decode) {
            if(err){
                let response=error_function({
                    statusCode:400,
                    message:"Authentication failed"
                });
                return res.status(response.statusCode).send(response);
            }
            console.log("decoded",decode);

            let user=await users.findOne({_id:decode.user_id}).populate("user_type");
            console.log(user);

            if(!user){
                let response=error_function({
                    statusCode:400,
                    message:"user not found"
                });
                return res.status(response.statusCode).send(response);
            }


            if (!user.user_type) {
                let response = error_function({
                    statusCode: 400,
                    message: "User type not defined"
                });
                return res.status(response.statusCode).send(response);
            }

            let user_type=user.user_type.user_type;
            console.log("user type:",user_type);

            let allowed=access_types.split(",").map((obj)=>control_data[obj]);
            console.log("allowed",allowed);

            if(allowed && allowed.includes(user_type)){
                return next();
            }
            else{
                let response = error_function({
                    statusCode: 403,
                    message: "Not allowed to access the route"
                });
                return res.status(response.statusCode).send(response);
            }
            
        });
    }
    catch(error){
        console.log("error :", error);
        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong"
        });
        res.status(response.statusCode).send(response);
    }
    
}