import express from 'express'
import fs from 'fs'

const app=express()
const ROOT_FOLDER='./approutes/'
app.use(express.json())
app.use(express.urlencoded({extended: true}));
async function handleRegularRoutes(fileUrl,req,res){
    try{
        const module=await import(fileUrl);
        console.log(module);
         let data=null;
         const httpVerb=req.method.toUpperCase()
         console.log(httpVerb);
         if (module[httpVerb]) 
            data = module[httpVerb](req, res);
         else 
            data = module.handler(req, res);
         return data;
    }catch(e){
        console.log(e);      
        res.statusCode=404;
        return false;
    }
}

app.all('/*', async(req,res)=>{
    let fileUrl=(ROOT_FOLDER+req.url).replace('//','/')
    console.log(fileUrl);
    let isFile=fs.existsSync(fileUrl+'.js')
    if(!isFile) {
        fileUrl+='/index.js'
    }else{
        fileUrl+='.js'
    }
    let result=await handleRegularRoutes(fileUrl,req,res);
    if(result===false){
        return res.send('Route not found')
    }else{
        return res.send(result)
    } 

})
app.get('/',(req,res)=>{
    return res.send(`Received a hello world from /`)
})

app.listen(3000,()=>{
    console.log(`Server is running on port 3000`);
})