import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
import base64
import time
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

from user.models import CustomUser
from .models import FriendRequest
from channels.db import database_sync_to_async

def base64_url_decode(base64_url):
    """Base64 URL decode without any library"""
    padding = '=' * (4 - (len(base64_url) % 4))  # Add padding
    base64_url = base64_url.replace('-', '+').replace('_', '/')
    return base64.b64decode(base64_url + padding)


def decode_jwt(jwt):
    """Decode JWT and return the header and payload"""
    try:
        parts = jwt.split(".")
        
        if len(parts) != 3:
            raise ValueError("Invalid JWT: must have 3 parts")

        header = base64_url_decode(parts[0]).decode("utf-8")
        payload = base64_url_decode(parts[1]).decode("utf-8")
        
        header_json = json.loads(header)
        payload_json = json.loads(payload)
        
        return header_json, payload_json
    except Exception as e:
        return {"error": str(e)}


def check_token_validity(jwt):
    """Check if the JWT token is structurally valid"""
    header, payload = decode_jwt(jwt)
    
    if "error" in header:
        return False, header["error"]  
    
    if "exp" in payload:
        exp_time = payload["exp"]
        if exp_time < time.time():
            return False, "Token is expired"
    
    if "username" not in payload:
        return False, "Token does not contain username"

    return True, "Token is valid"

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        self.username = token

        is_valid, message = check_token_validity(token)
        if is_valid == False:
            await self.close()

        header, payload = decode_jwt(token)
        self.username = payload.get("username", "guest_user")

        await self.channel_layer.group_add("chat_room", self.channel_name)

        await self.channel_layer.group_add(f"user_{self.username}", self.channel_name)

        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat_room", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "send_message":
            message = data.get("message", "")
            await self.channel_layer.group_send(
                "chat_room",
                {
                    "type": "chat_message",
                    "message": message,
                    "username": self.username, 
                },
            )

        elif action == "send_friend_request":
            recipient_username = data.get("recipient")
            await self.send_friend_request(recipient_username)

        elif action == "accept_friend_request":
            sender_username = data.get("sender")
            await self.accept_friend_request(sender_username)

    @database_sync_to_async
    def get_user_by_username(self, username):
        return CustomUser.objects.get(username=username)

    @database_sync_to_async
    def create_friend_request(self, sender, recipient):
        return FriendRequest.objects.create(sender=sender, recipient=recipient, status="pending")

    @database_sync_to_async
    def get_pending_friend_request(self, sender, recipient):
        return FriendRequest.objects.filter(sender=sender, recipient=recipient, status="pending").first()

    @database_sync_to_async
    def update_friend_request_status(self, friend_request):
        friend_request.status = "accepted"
        friend_request.save()

    async def send_friend_request(self, recipient_username):
        try:
            sender = await self.get_user_by_username(self.username)
            recipient = await self.get_user_by_username(recipient_username)

            if sender == recipient:
                await self.send(text_data=json.dumps({"error": "You cannot send a friend request to yourself."}))
                return

            existing_request = await self.get_pending_friend_request(sender, recipient)
            if existing_request:
                await self.send(text_data=json.dumps({"error": "Friend request already sent."}))
                return

            await self.create_friend_request(sender, recipient)

            await self.channel_layer.group_send(
                f"user_{recipient_username}",
                {
                    "type": "friend_request_notification",
                    "sender": self.username,
                    "recipient": recipient_username,
                },
            )

        except CustomUser.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "User not found."}))

    async def accept_friend_request(self, sender_username):
        try:
            sender = await self.get_user_by_username(sender_username)
            recipient = await self.get_user_by_username(self.username)

            friend_request = await self.get_pending_friend_request(sender, recipient)

            if not friend_request:
                await self.send(text_data=json.dumps({"error": "No pending friend request found."}))
                return

            await self.update_friend_request_status(friend_request)

            await self.channel_layer.group_send(
                f"user_{sender_username}",
                {
                    "type": "friend_request_accepted",
                    "sender": self.username,
                    "recipient": sender_username,
                },
            )

            await self.channel_layer.group_send(
                f"user_{recipient.username}",
                {
                    "type": "friend_request_accepted",
                    "sender": sender_username,
                    "recipient": recipient.username,
                },
            )

        except CustomUser.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "User not found."}))

    async def friend_request_notification(self, event):
        await self.send(text_data=json.dumps({
            "action": "friend_request",
            "sender": event["sender"],
            "recipient": event["recipient"],
        }))

    async def friend_request_accepted(self, event):
        await self.send(text_data=json.dumps({
            "action": "friend_request_accepted",
            "sender": event["sender"],
            "recipient": event["recipient"],
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "username": event["username"],     
        }))


