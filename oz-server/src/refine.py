from openai import OpenAI
client = OpenAI()
# from groq import Groq
# client = Groq()


async def refine_msg(chat_history, user_message):
    print("refining the message")
    message = f"""
        {{
            "role": "message-refiner",
            "content": "Refine the message: {user_message}. Focus on ensuring it is clear, concise, and empathetic."
        }}
        {{
            "output": "only output the refined{user_message}"
        }}
        """
    llm = client.chat.completions.create(
    # model="llama-3.1-70b-versatile",
    model="gpt-4o",
    messages=[
        {"role": "system", "content": " You are an expert in refining the message"},
        {"role": "user", "content": message}
    ]
    )
    return llm.choices[0].message.content