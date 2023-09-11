const express = require('express');
const cors = require('cors');
const {deleteEmails, authorize} = require('./logic');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.post('/delete', async(req,res) => {
    try {
        const auth = await authorize();
        await deleteEmails(auth);
        res.status(200).send('Emails successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Internal server error'}); 
    }
});

app.listen(port, () => {
    console.log(`App listening to http://localhost:${port}`);
})

