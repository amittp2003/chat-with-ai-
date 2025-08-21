import OpenAI from "openai";
import { NextRequest } from "next/server";
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.QWEN_API_KEY,
});

export async function POST(request: NextRequest){
    try{
        const{message} = await request.json();

        const completion = await openai.chat.completions.create({
            model: "qwen/qwen3-coder:free",
            messages: [{role: 'user', content: "message"}],
        });

        return Response.json({
            response: completion.choices[0].message.content,
        });
    }catch(error){
        return Response.json(
            {
                error: "Failed to process request",
            },
            {status: 500}
        );
    }
}