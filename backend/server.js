const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            return res.status(502).json({ error: 'n8n returned an error' });
        }

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error(`Error fetching n8n: ${error}`);
        return res.status(502).json({ error: 'Could not reach n8n' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});