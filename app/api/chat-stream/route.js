import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.QWEN_API_KEY,
});

export async function POST(request){
    try{
        const {message} = await request.json();

        const stream = await openai.chat.completions.create({
            model: "qwen/qwen3-coder:free",
            messages: [{role: 'user', content: message}],
            stream: true, 
        });

        //keeps in queue and sends data image encoder for image 
        const encoder = new TextEncoder();

        //this actually sends data that we can read readableStream
        const readable = new ReadableStream({
            //start controller asynchronously 
            async start(controller) {
                //read a chunk of data ie.stream
                for await(const chunk of stream){
                    //incomplete data thats why delta
                    const content = chunk.choices[0].delta?.content || "";
                    //if theres content we put it in queue and send that json data
                    if(content){
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({content})}\n\n`));
                    };
                }
                //then close controller
                controller.close();
            },
        });
        return new Response(readable, {
            headers:{
                'Content-Type': "text/event-stream",
                'cache-control': 'no-cache',
                'Connection': 'keep-alive'
            }
        })
    }catch(error){
        return Response.json(
            {
                error: "Failed to process request",
            },
            {status: 500}
        );
    }
}