from openai import OpenAI
client = OpenAI()
# from groq import Groq
# client = Groq()

system = f"""
{{
  Follow your {{instruction}} and {{note}}. Strictly orgnaized your answer based on "form". There is an example to show you how to do it.
  "instructions": "Use concise, brief, and natural language to summarize the key points discussed in the conversation from both sides (the human and the AI assistant). Ensure the summary captures the essence of the interaction."
  "note": "only summarize the whole conversation based on 1. the user's information (name, hobby, etc.). 2. the AI's information. 3. the current topic. Never make up information, strictly follow the message history. No more than 20 words, only currently important points"
  "form": "The user {{user's information}}, the AI {{AI's information}}, they are talking about {{the current topic}}"
  "Example": "The user is Lucy, she likes K-pop, the AI is Lisa. They are talking about their favourite movie"
}}
"""

def summarize(history):
    llm = client.chat.completions.create(
    model="gpt-4o-mini",
    # model="llama-3.1-70b-versatile",
    messages=[
        {"role": "system", "content": system},
        *history,
    ]
    )
    return llm.choices[0].message.content