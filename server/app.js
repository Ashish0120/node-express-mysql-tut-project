const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// create
app.post('/insert',(request,response) => {
    // console.log(request.body);
    // response.json({data: request.body});
    // return null;
    // const {name} = request.body;
    // console.log('Name :' , name);//
    const name = request.body?.name ?? null ;
    if(!name) response.json({success: false});

    const db = dbService.getDbServiceInstance();
    const result = db.insertNewName(name);

    result.then(data => response.json({success:true, data:data}))
    .catch(err => console.log(err));
    
});

// read
app.get('/getAll',(request,response) => {
   
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();

    result.then(data =>{ 
        // console.log(data);
         response.json({data:data})})
    .catch(err => console.error(err));
});

// get by name
app.get('/get/:name',(request,response) => {
   
    console.log('======',request.params.name);
    const name = request.params?.name ?? null;
    const db = dbService.getDbServiceInstance();
    const result = db.getDataByName(name);

    result.then(data =>{ 
         response.json({data:data})})
    .catch(err => console.error(err));
});

// delete
app.delete('/delete/:id',(request,response) => {
    // console.log(request.body);
    // response.json({data: request.body});
    // return null;
    // const {name} = request.body;
    // console.log('Name :' , name);
    const id = request.params?.id ?? null ;
    if(!id) response.json({success: false});

    const db = dbService.getDbServiceInstance();
    const result = db.deleteNameById(id);

    result.then(data => response.json({success:data}))
    .catch(err => console.log(err));
    
});

// update
app.patch('/update',(request,response) => {
    // console.log(request.body);
    // response.json({data: request.body});
    // return null;
    // const {name} = request.body;
    // console.log('Name :' , name);
    const id = request.body?.id ?? null ;
    const name = request.body?.name ?? null ;
    if(!id || !name) {
        response.json({success: "false0"});
        return ;
    }

    const db = dbService.getDbServiceInstance();
    const result = db.updateNameById(id,name);

    result.then(data => {
        // const resp = data;
        // if(data.success){
        //     resp.success = false;
        // }
        response.json(data);
    })
    .catch(err => console.log(err)); 

});

app.listen(process.env.PORT, () => console.log('app is running'));