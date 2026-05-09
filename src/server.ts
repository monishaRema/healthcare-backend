import app from "./app";

const bootstrap = () =>{
    try {
        app.listen(5000,() =>{
            console.log("Server is running on port 5000")
        })
        
    } catch (error) {
        console.error("Server failed: ", error)
    }
}

bootstrap();