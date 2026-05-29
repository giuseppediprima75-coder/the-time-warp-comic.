export interface Character {
  name: string;
  description: string;
}

async function callGeminiApi(action: string, text: string, characters: Character[]): Promise<string> {
  try {
    const response = await fetch(`/api/gemini/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, characters }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Il server ha risposto con codice ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error: any) {
    console.error(`Errore API Gemini (${action}):`, error);
    throw new Error(error.message || "Connessione al server di intelligenza artificiale fallita. Verifica la connettività.");
  }
}

export const analyzeScene = (text: string, characters: Character[]) => {
  return callGeminiApi('analyze', text, characters);
};

export const generateIdeas = (text: string, characters: Character[]) => {
  return callGeminiApi('ideas', text, characters);
};

export const generateSocialContent = (text: string, characters: Character[]) => {
  return callGeminiApi('social', text, characters);
};

export const generateCoverPrompt = (text: string, characters: Character[]) => {
  return callGeminiApi('cover', text, characters);
};

export const getQuickSuggestion = (text: string, characters: Character[]) => {
  return callGeminiApi('quick', text, characters);
};

export const continueWriting = (text: string, characters: Character[]) => {
  return callGeminiApi('write', text, characters);
};
