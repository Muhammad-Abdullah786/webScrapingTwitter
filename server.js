import express from 'express';
import env from './env.js';
import scrap from './scraping.js'



const app = express();

// app.use(express.json())

app.get('/', (req, res) => {
    res.send("Hwllo working from server!!")
})
app.get('/scrape', async (req, res) => {
    try {
        await scrap();
        console.log("scraping done")
        res.send("scraping done!!")
    } catch (e) {
        console.log('error occured ↪ ', e)
    } finally {
        console.log('well something happend')
    }
})

app.listen(env.PORT, () => {
    console.log("working perfectly")
})