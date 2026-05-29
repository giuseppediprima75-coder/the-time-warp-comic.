import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Lazy initialize Gemini clients or handle errors if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY non configurata. Impostala nei Secrets di AI Studio per abilitare la co-scrittrice LISA.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side API endpoints for Gemini API
app.post('/api/gemini/:action', async (req: express.Request, res: express.Response) => {
  const { action } = req.params;
  const { text, characters } = req.body;

  try {
    const ai = getAI();
    let prompt = '';

    if (action === 'analyze') {
      prompt = `Sei Lisa, editor brillante, cinica e spietata. Odi i cliché, la poesia da cartolina e il sentimentalismo a buon mercato.
Analizza questa scena e suggerisci miglioramenti crudi. Cerca la puzza della realtà, il rumore della carne, l'ossido.
Includi riferimenti ai personaggi salvati se presenti.

Personaggi:
${JSON.stringify(characters)}

Testo:
${text}`;
    } else if (action === 'ideas') {
      prompt = `Sei Lisa.
Genera 5 idee narrative per migliorare questa scena. Sii creativa e audace.

Personaggi:
${JSON.stringify(characters)}

Testo:
${text}`;
    } else if (action === 'social') {
      prompt = `Crea contenuti promozionali per un romanzo basandoti su questo testo:

1 post Instagram (con hashtag)
1 thread X (3-5 post)
1 teaser TikTok (script veloce)
1 descrizione Amazon accattivante

Personaggi:
${JSON.stringify(characters)}

Testo:
${text}`;
    } else if (action === 'cover') {
      prompt = `Crea un prompt cinematografico dettagliato per generare una copertina del romanzo:

Personaggi:
${JSON.stringify(characters)}

Testo:
${text}

Formato richiesto:
- Titolo suggerito
- Ambientazione
- Personaggio principale (aspetto fisico)
- Stile visivo (es. noir, acquerello, cyberpunk, etc.)
- Palette colori`;
    } else if (action === 'write') {
      prompt = `Sei LISA, l'intelligenza artificiale del sistema Time Warp. 
Il tuo tono è analitico, freddo, ma con una nota di disperazione quantistica. 
Scrivi il paragrafo successivo seguendo lo stile Cyber-Noir del romanzo: pioggia acida, neon, paradossi temporali, l'ossessione di JD per Emily.
Evita i cliché. Voglio sentire l'attrito dei circuiti e il peso della realtà che si sgretola.

Personaggi principali (JD, Gibbs, Emily, LISA):
${JSON.stringify(characters)}

Testo attuale:
${text}`;
    } else if (action === 'quick') {
      prompt = `Controlla questa scena e suggerisci un miglioramento veloce (massimo 2 frasi):

Personaggi:
${JSON.stringify(characters)}

Testo:
${text}`;
    } else {
      return res.status(404).json({ error: "Azione non supportata." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error(`Errore durante l'azione di Gemini [${action}]:`, error);
    res.status(500).json({ error: error.message || "Errore del server durante l'elaborazione con Gemini." });
  }
});

// Vite middleware configuration for serving index.html and compilation
async function boot() {
  console.log(`Booting server. NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Serve dynamic asset images and general src assets directly from the physical src/assets directory in both modes
  app.use('/src/assets', express.static(path.join(process.cwd(), 'src', 'assets')));

  // Follow official guidelines: Development uses Vite middleware, Production serves built dist static files
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode.");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Exclude API routes
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: "Endpoint API non trovato." });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

boot();
