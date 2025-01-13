export const handler = (req, res) => {
  if(req.method==='POST')
  {
    console.log(`It was POST request`);
    
  }else if (req.method === "GET") {
    console.log(`It was GET request`);
  }
  return "User Index file";
};
