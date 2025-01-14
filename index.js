import express from 'express'
import fs from 'fs'

const app=express()
const ROOT_FOLDER='./approutes/'
app.use(express.json())
app.use(express.urlencoded({extended: true}));
async function handleRegularRoutes(fileUrl,req,res){
    try{
        const module=await import(fileUrl);
        // console.log(module);
         let data=null;
         const httpVerb=req.method.toUpperCase()
        // console.log(httpVerb);
         if (module[httpVerb]) 
            data = module[httpVerb](req, res);
         else 
            data = module.handler(req, res);
         return data;
    }catch(error){
        console.log(`Error in handleRegularRoutes`, error);      
        res.statusCode=404;
        return false;
    }
}
async function handleDynamicRoutes(folder) {
    try {
         const files=await fs.promises.readdir(folder);
         const dynamicFileName=files.find(fname=>{
            return fname.match(/\[[a-zA-Z0-9\._]+\]/)
         })
         console.log(dynamicFileName); 
         const dynamicObj= {
            file:dynamicFileName,
            param:dynamicFileName.replace("[","").replace("].js","")
         }
         return dynamicObj
         console.log(`Dynamic Object is`,dynamicObj);
    } catch (error) {
        console.log(`Error in handleDynamicRoutes`, error);      
        return null
    }
}
app.all('/*', async(req,res)=>{
    let fileUrl=(ROOT_FOLDER+req.url).replace('//','/')
    let isFile=fs.existsSync(fileUrl+'.js')
    if(!isFile) {
        fileUrl+='/index.js'
    }else{
        fileUrl+='.js'
    }
    console.log('fileUrl is ',fileUrl);
    let result=await handleRegularRoutes(fileUrl,req,res);
    if(result===false){
        const pathArray=(ROOT_FOLDER+req.url).replace('//','/').split('/')
        console.log(`pathArray is`,pathArray);
        const lastElement=pathArray.pop()//pops and removes last element
        const folderToCheck=pathArray.join('/')
        console.log(`folderToCheck is`,folderToCheck);
        const dynamicHandler=await handleDynamicRoutes(folderToCheck);
        console.log(`Dynamic Handler is `,dynamicHandler);        
        if(!dynamicHandler)
            return res.send('Route not found')
        req.params={...req.params,[dynamicHandler.param]:lastElement}
        result=await handleRegularRoutes([folderToCheck, dynamicHandler.file].join('/'),req,res)
        console.log(`Result is->`,result);        
        res.statusCode=200
        return res.send(result)
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