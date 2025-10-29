import json
import datetime
import asyncio
import requests
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel

from .detect import detect, detectanl
from .chat import chat,chat1,chat2
from .summary import summarize
from .refine import refine_msg

app = FastAPI()

multi = False


class UserQuery(BaseModel):
    query: str


chat_history = []
active_connections = []


class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

chat_history = []

file_name = ""


async def save_chat_history(message):
    global file_name
    with open(file_name, "a") as f:
        json.dump(message, f)
        f.write("\n")  # 每条记录之间换行，方便阅读

@app.post("/generate")
async def generate(userQuery: UserQuery):
    print(userQuery.query)
    now = datetime.datetime.now()
    time_str = now.strftime("%m-%d_%H-%M-%S")
    chat_history.append({
        "role": "user",
        "content": userQuery.query,
        "timestamp": time_str
    })

    if(multi):
        detected,detectinfo, responsea, responseb, responsec, _ = await asyncio.gather(
            detect(userQuery.query),
            detectanl(userQuery.query),
            chat(chat_history, userQuery.query),  # 第一个chat响应
            chat1(chat_history, userQuery.query),  # 第二个chat响应
            chat2(chat_history, userQuery.query),  # 第三个chat响应
            save_chat_history({
                "role": "user",
                "content": userQuery.query,
                "timestamp": time_str
            })
        )

        res = {
            "human_message": userQuery.query,
            "ai_message_one": responsea,
            "ai_message_two": responseb,
            "ai_message_three": responsec,
            "sensitivity": detected,
            "explanation": detectinfo,
        }
        print("sending response", res)
        await manager.broadcast(json.dumps(res))
    else:
        detected, detectinfo, responsea,  _ = await asyncio.gather(
            detect(userQuery.query),
            detectanl(userQuery.query),
            chat(chat_history, userQuery.query),  # 第一个chat响应
            save_chat_history({
                "role": "user",
                "content": userQuery.query,
                "timestamp": time_str
            })
        )

        res = {
            "human_message": userQuery.query,
            "ai_proposed_message": responsea,
            "sensitivity": detected,
            "explanation": detectinfo,
        }
        print("sending response", res)
        await manager.broadcast(json.dumps(res))

@app.get("/history")
async def get_history():
    return chat_history


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global file_name
    await manager.connect(websocket)
    print("connected")
    now = datetime.datetime.now()
    time_str = now.strftime("%m-%d_%H-%M-%S")
    file_name = f"./data/chat_history{time_str}.json"

    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            if data["kind"] == "refine":
                input = data["message"]
                response = await refine_msg(chat_history, input)
                await manager.broadcast(json.dumps({
                    "kind": "refined",
                    "message": response,
                }))
            else:
                now = datetime.datetime.now()  # 在此处生成新的时间戳
                time_str = now.strftime("%m-%d_%H-%M-%S")
                chat_history.append({
                    "role": "assistant",
                    "content": data["message"],
                    "timestamp": time_str,
                })
                requests.post("http://orchestration-server:8080/event", json={"body": {
                    "text": data["message"]
                }})
                await save_chat_history({
                    "role": "assistant",
                    "content": data["message"],
                    "timestamp": time_str,
                })
                summary = summarize(chat_history)
                await manager.broadcast(json.dumps({
                    "kind": "summary",
                    "summary": summary,
                }))
    except Exception as e:
        manager.disconnect(websocket)  # Ensure to remove on disconnect/error
        chat_history.clear()

    # 1. detect the sensitivity of the user input
    # 2. response the user input
    # 3. summarize the conversation
    # 4. repeat the user input



