import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import { v4 as v4Uuid } from 'uuid';

export const getReadingValueFromImage = async (image: string) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) throw new Error('No Gemini API key found');

  const imageResponse = await uploadImage(image);

  if (!imageResponse) throw new Error('Error trying to save image on Gemini API');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent([
    { fileData: { mimeType: imageResponse.mimeType, fileUri: imageResponse.uri } },
    { text: 'Extract the measure value from the image. Return only the value as a number.' },
  ]);

  return { imageUrl: imageResponse.uri, measureValue: result.response.text() };
};

async function uploadImage(base64Image: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error('No Gemini API key found');

    const fileBuffer = Buffer.from(base64Image, 'base64');
    const uploadDirectory = path.join(__dirname, 'uploads');
    const displayName = v4Uuid();
    const filePath = path.join(uploadDirectory, displayName);

    if (!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory, { recursive: true });

    fs.writeFileSync(filePath, fileBuffer);

    const fileManager = new GoogleAIFileManager(apiKey);
    const response = await fileManager.uploadFile(filePath, {
      mimeType: 'image/jpeg',
      displayName,
    });

    return response.file;
  } catch (error) {
    console.error(error);

    return null;
  }
}
