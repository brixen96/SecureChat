from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user: str):
        await websocket.accept()
        if user not in self.active_connections:
            self.active_connections[user] = []
        self.active_connections[user].append(websocket)

    def disconnect(self, websocket: WebSocket, user: str):
        if user in self.active_connections:
            self.active_connections[user].remove(websocket)
            if not self.active_connections[user]:
                del self.active_connections[user]

    async def send_personal_message(self, message: str, user: str):
        if user in self.active_connections:
            for connection in self.active_connections[user]:
                await connection.send_text(message)

    async def broadcast_to_admins(self, message: str, admins: List[str]):
        for admin in admins:
            if admin in self.active_connections:
                for connection in self.active_connections[admin]:
                    await connection.send_text(message)

manager = ConnectionManager()