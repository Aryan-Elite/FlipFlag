import express from 'express';
import dotenv from 'dotenv';
import { pool,testConnection } from '../db/client.js';
dotenv.config();
const app=express();
const PORT=process.env.PORT;
app.get('/',(req,res)=>{

    res.send('Hello World');
})



app.listen(PORT,()=>{
    console.log('Server is listening on port ',PORT);
})


const dbConnected = await testConnection();
if (!dbConnected) {
  console.error('Could not connect to database. Exiting.');
  process.exit(1);
}

// npx auth init
// npm i @better-auth/infra
// npx ngrok http 3000