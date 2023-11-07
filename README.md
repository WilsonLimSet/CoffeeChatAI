# [Coffee Chat AI](https://www.coffeechatai.com/)

This project generates questions to ask on a Coffee Chat for you using AI.
[!(./public/coffeechatscreenshot.png)]
## How it works
Template taken from - https://www.twitterbio.io/

This project uses the [ChatGPT API](https://openai.com/api/) and the [Vercel AI SDK](https://sdk.vercel.ai/docs) with streaming. It constructs a prompt based on the form and user input, sends it to the ChatGPT API with a Vercel Edge Function, then streams the response back to the application UI.
