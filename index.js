const express = require('express');
const app = express();
const { sendMail, serverAdapter, tempcron } = require('./queues/emailQueue');

app.use(express.json());
app.use('/admin/bull', serverAdapter.getRouter());

tempcron({ status: `OK ${new Date()}`, message: `I'm fine`});

app.post('/sendMail', async(req, res)=>{
    const {message, ...restbody} = req.body;
    await sendMail({
        ...restbody,
        html : `<p> ${message} </p>`
    });
    res.json({ status : 'ok'});
});

app.listen(3000, ()=>console.log('Server is up on 3000'));