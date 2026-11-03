const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mbbs")
    .then(()=> {
        console.log("MongoDB Connected Successfully")
    })
    .catch((error)=> {
        console.log("not connected" , error); 
    });

    