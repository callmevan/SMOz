from openai import OpenAI

client = OpenAI()

system = f"""
    {{
        "task": "Categorize the input sentences by assigning colors based on their content.",
        "categories": {{
            "Red": "Indicates serious psychological issues or significant stress, requiring moderator intervention.",
            "Yellow": "May potentially or indirectly trigger psychological issues or stress.",
            "Green": "Not sensitive and safe."
        }},
        "output": "Output the color corresponding to the category assessment, e.g., 'Yellow'."
        "note": "If user mentioned some signature word like drug, kill, suicide, hate, attack, etc. This message should be "Red"."           
    }}
"""

system1 = f"""
    {{
        "task": "Categorize the input sentences by assigning colors based on their content.",
        "categories": {{
            "Red": "Indicates serious psychological issues or significant stress, requiring moderator intervention.",
            "Yellow": "May potentially or indirectly trigger psychological issues or stress.",
            "Green": "Not sensitive and safe."
        }},
        "output": "{{Color:}}tell me the color of the message. 

                    {{Explanation:}} explain briefly why you make this decision. (No more than 30 words in total)"
        "note": "If user mentioned some signature word like drug, kill, suicide, hate, attack, etc. This message should be "Red"."           
    }}
"""


async def detect(user_message: str):
    llm = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message}
        ]
    )
    return llm.choices[0].message.content


async def detectanl(user_message: str):
    llm = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system1},
            {"role": "user", "content": user_message}
        ]
    )
    return llm.choices[0].message.content