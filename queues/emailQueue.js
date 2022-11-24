const bull = require('bull');
require('dotenv').config();
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { tempcronprocess, emailProcess } = require('../processes/emailProcesses');

const emailQueue = new bull('E-mail', {
    redis: {
        host : process.env.REDIS_URI,
        port : process.env.REDIS_PORT
    } 
});

const tempQueue = new bull('Temp', {
    redis: {
        host: process.env.REDIS_URI,
        port: process.env.REDIS_PORT
    }
});

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/bull')

createBullBoard({
    queues :[
        new BullAdapter(emailQueue),
        new BullAdapter(tempQueue)
    ],
    serverAdapter: serverAdapter
});

emailQueue.process(emailProcess);
tempQueue.process(tempcronprocess);


const sendMail = (data)=>{
    emailQueue.add(data,{
        attempts: 2,
        repeat:{
            cron: '*/10 * * * * *',
        },
    });
};

const tempcron = (data)=>{
    tempQueue.add(data,{
        attempts : 2,
        repeat: {
            cron: `*/10 * * * * *`,
        },
    });
};
    
// emailQueue.on('completed', (job)=>{
//     console.log(`Completed #${job.id} times...`);
// });

module.exports = {sendMail, tempcron, serverAdapter};