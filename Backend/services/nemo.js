// import OpenAI from 'openai';
const { OpenAI } = require("openai");

if (require.main === module)
    require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function streamToText(prompt) {
    const completion = await openai.chat.completions.create({
        model: "nvidia/nvidia-nemotron-nano-9b-v2",
        messages: [{ "role": "system", "content": `${prompt}` }],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 2048,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        extra_body: {
            min_thinking_tokens: 1024,
            max_thinking_tokens: 2048
        }
    })

    let reason_text = '';
    let final_text = '';
    for await (const chunk of completion) {
        const reasoning = chunk.choices[0]?.delta?.reasoning_content;
        if (reasoning)
            reason_text += reasoning;
        else
            final_text += chunk.choices[0]?.delta?.content || '';
    }

    return final_text;
}


//test this module
if (require.main == module) {
    let test_prompt = "Return a 5 keywords for this listing. https://www.loopnet.com/Listing/66-Franklin-St-Oakland-CA/26031368/; nothing more, only 5 words with commas as delimeters"
    streamToText(test_prompt).then((text) => {
        console.log(text);
    });
}