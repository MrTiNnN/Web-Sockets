import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
import base64
import time
import os
import django
from itertools import chain

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

from user.models import CustomUser
from .models import FriendRequest, ChatMessages
from channels.db import database_sync_to_async

# JWT BASE64 URL DECODE
def base64_url_decode(base64_url):
    """Base64 URL decode without any library"""
    padding = '=' * (4 - (len(base64_url) % 4))  # Add padding
    base64_url = base64_url.replace('-', '+').replace('_', '/')
    return base64.b64decode(base64_url + padding)

# JWT DECODE
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

# TOKEN VALIDITY
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

# MAIN CONSUMER
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # GET TOKEN FROM QUERY
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        # IS THE TOKEN VALID
        is_valid, message = check_token_validity(token)
        if is_valid == False:
            await self.close()

        # GET TOKEN DECODED AND SET SELF.USERNAME
        header, payload = decode_jwt(token)
        self.username = payload.get("username", "guest_user")

        # ADD USER TO MAIN CHAT ROOM
        await self.channel_layer.group_add("chat_room", self.channel_name)

        # ADD USER TO HIS OWN ROOM (FOR NOTIFICATIONS)
        await self.channel_layer.group_add(f"user_{self.username}", self.channel_name)

        await self.accept()
    
    async def disconnect(self, close_code):
        # DISCONNECT FROM THE ROOMS
        await self.channel_layer.group_discard("chat_room", self.channel_name)
        await self.channel_layer.group_discard(f"user_{self.username}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data) # load body
        action = data.get("action") # type of action

        # SEND MESSAGE TO GLOBAL ROOM
        if action == "send_message":
            message = data.get("message", "")
            recipient_username = data.get("recipient")

            if recipient_username:
                chat_group = self.get_chat_group_name(self.username, recipient_username)

                await self.channel_layer.group_send(
                    chat_group,
                    {
                        "type": "chat_message_private",
                        "message": message,
                        "username": self.username,
                        "recipient": recipient_username,
                    },
                )

                await self.save_message(self.username, message, chat_group)

            else:
                await self.channel_layer.group_send(
                    "chat_room",
                    {
                        "type": "chat_message",
                        "message": message,
                        "username": self.username, 
                    },
                )

                await self.save_message(self.username, message, "chat_room")

        # SEND RFIEND REQUEST
        elif action == "send_friend_request":
            recipient_username = data.get("recipient")
            await self.send_friend_request(recipient_username)

        # ACCEPT FRIEND REQUEST
        elif action == "accept_friend_request":
            sender_username = data.get("sender")
            await self.accept_friend_request(sender_username)

        # JOIN PRIVATE FRIEND CHAT
        elif action == "join_friend_chat":
            recipient_username = data.get("recipient")
            is_friends = await self.check_friendship(recipient_username)
            if is_friends:
                chat_group = self.get_chat_group_name(self.username, recipient_username)

                await self.channel_layer.group_add(chat_group, self.channel_name)

                await self.send(text_data=json.dumps({"message": f"Joined chat with {recipient_username} , this is the chat's name: {chat_group}", "action": action}))
            else:
                await self.send(text_data=json.dumps({"error": "You are not friends with this user."}))

        # DECLINE FRIEND REQUEST
        elif action == "decline_friend_request":
            recipient_username = data.get("recipient")
            await self.decline_friend_request(recipient_username)

        # LOADS MESSAGES FOR FRONTEND
        elif action == "load_more_messages":
            last_message_id = data.get("last_message_id")
            recipient_username = data.get("recipient")
            batch_size = 50

            if last_message_id == 0:
                    await self.send(text_data=json.dumps({
                        "error": "No more messages!",
                    }))
                    return

            if recipient_username:
                chat_group_name = self.get_chat_group_name(self.username, recipient_username)
                
                if last_message_id:
                    pass

                else:
                    last_message_id = await self.get_last_message_id(chat_group_name)
                    if last_message_id == None:
                        await self.send(text_data=json.dumps({
                            "error": "No messages found!",
                        }))

                messages = await self.get_messages_in_range(chat_group_name, last_message_id, batch_size)

                if not messages:
                    await self.send(text_data=json.dumps({
                        "error": "No more messages!",
                    }))
                    return

            else:
                
                if last_message_id:
                    pass

                else:
                    last_message_id = await self.get_last_message_id("chat_room")
                    if last_message_id == None:
                        await self.send(text_data=json.dumps({
                            "error": "No messages found!",
                        }))
                
                messages = await self.get_messages_in_range("chat_room", last_message_id, batch_size)

                if not messages:
                    await self.send(text_data=json.dumps({
                        "error": "No more messages!",
                    }))
                    return

            await self.send(text_data=json.dumps({
                "action": "load_more_messages",
                "messages": messages,
            }))

        # GETS THE FRIEND REQUESTS OF A USER
        elif action == "get_friend_requests":
            user = await self.get_user_by_username(self.username)
            friend_requests = await self.get_friend_requests(user)
            await self.channel_layer.group_send(
            f"user_{self.username}",
            {
                "type": "send_data",
                "action": "get_friend_requests",
                "friend_requests": friend_requests,
            }
        )

        # GETS THE FRIEND REQUESTS SEND FROM A USER
        elif action == "get_friend_requests_send_from_you":
            user = await self.get_user_by_username(self.username)
            get_friend_requests_send_from_you = await self.get_friend_requests_send_from_you(user)
            await self.channel_layer.group_send(
            f"user_{self.username}",
            {
                "type": "send_data",
                "action": "get_friend_requests_send_from_you",
                "get_friend_requests_send_from_you": get_friend_requests_send_from_you,
            }
        )

        # GETS USER'S FRIENDS
        elif action == "get_user_friends":
            user = await self.get_user_by_username(self.username)
            get_user_friends = await self.get_user_friends(user)
            await self.channel_layer.group_send(
            f"user_{self.username}",
            {
                "type": "send_data",
                "action": "get_user_friends",
                "user_friends": get_user_friends,
            }
        )


    # FUNCTION FOR GETTING USERS
    @database_sync_to_async
    def get_user_by_username(self, username):
        return CustomUser.objects.get(username=username)

    # CREATE A UNIQUE CHAT GROUP NAME FOR TWO USERS
    def get_chat_group_name(self, user1, user2):
        sorted_users = sorted([user1, user2])
        return f"chat_{sorted_users[0]}_{sorted_users[1]}"

    # GET THE PENDING FRIND REQUEST
    @database_sync_to_async
    def get_pending_friend_request(self, sender, recipient):
        return FriendRequest.objects.filter(sender=sender, recipient=recipient, status="pending").first()

    # GETS THE MESSAGES WANTED TO SEND
    @database_sync_to_async
    def get_messages_in_range(self, chat_room, last_message_id, batch_size):
        start_id = last_message_id - batch_size

        messages = ChatMessages.objects.filter(
            chat_room=chat_room,
            id__lt=last_message_id,
            id__gte=start_id,  
        )

        return list(messages.values("id", "message", "sender__username"))

    # GET LAST MESSAGE ID
    @database_sync_to_async
    def get_last_message_id(self, chat_room):
        last_message = ChatMessages.objects.filter(chat_room=chat_room).order_by('-id').first()

        if last_message:
            return last_message.id
        return None

    # RETURNS THE MESSAGE SEND TO A USER
    @database_sync_to_async
    def get_friend_requests(self, user):
        friend_requests = FriendRequest.objects.filter(recipient = user).select_related('sender', 'recipient')
        return list(friend_requests.values('id', 'sender__username', 'recipient__username', 'status'))
    
    # GET FRIEND REQUEST THAT YOU SEND
    @database_sync_to_async
    def get_friend_requests_send_from_you(self, user):
        friend_requests = FriendRequest.objects.filter(sender = user).select_related('sender', 'recipient')
        return list(friend_requests.values('id', 'sender__username', 'recipient__username', 'status'))
    
    # GET WHO IS YOUR FRINED
    @database_sync_to_async
    def get_user_friends(self, user):   
        requests1 = FriendRequest.objects.filter(sender=user, status="accepted").select_related('recipient')
        requests2 = FriendRequest.objects.filter(recipient=user, status="accepted").select_related('sender')
        
        combined_requests = list(chain(requests1.values('id', 'recipient__username', 'status'),
                                   requests2.values('id', 'sender__username', 'status')))
        return combined_requests
    
    # CHECK IF TWO USERS ARE FRIENDS
    @database_sync_to_async
    def check_friendship(self, recipient_username):
        recipient = CustomUser.objects.get(username=recipient_username)
        user = CustomUser.objects.get(username=self.username)
        return FriendRequest.are_friends(user, recipient)  



    # CREATE FRIEND REQUEST
    @database_sync_to_async
    def create_friend_request(self, sender, recipient):
        return FriendRequest.objects.create(sender=sender, recipient=recipient, status="pending")

    # DECLINE REQUEST
    @database_sync_to_async
    def decline_request(self, sender, recipient):
        friend_request = FriendRequest.objects.filter(sender=sender, recipient=recipient, status="pending").first()
        if friend_request:
            friend_request.delete()

    # UPDATE FRIEND REQUEST STATUS
    @database_sync_to_async
    def update_friend_request_status(self, friend_request):
        friend_request.status = "accepted"
        friend_request.save()



    # SEND FRIEND REQUEST FUNCTION
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

    # ACCEPT FRIEND REQUEST FUNCTION
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

    # DECLINE FRIEND REQUEST FUNCTION
    async def decline_friend_request(self, recipient_username):
        try:

            sender = await self.get_user_by_username(recipient_username)
            recipient = await self.get_user_by_username(self.username)

            friend_request = await database_sync_to_async(
            lambda: FriendRequest.objects.filter(sender=sender, recipient=recipient, status="pending").first()
            )()

            if friend_request:

                await self.decline_request(sender, recipient)

                await self.channel_layer.group_send(
                    f"user_{self.username}",
                    {
                        "type": "friend_decline_request",
                        "sender": recipient_username,
                        "recipient": self.username,
                    },
                )
                return
            else:
                await self.send(text_data=json.dumps({"error": "No pending friend request found."}))
        except CustomUser.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "User not found."}))
        except Exception as e:
            await self.send(text_data=json.dumps({"error": f"Decline unsuccessful: {str(e)}"}))    



    # FRIEND REQUEST NOTIFICATION
    async def friend_request_notification(self, event):
        await self.send(text_data=json.dumps({
            "action": "friend_request",
            "sender": event["sender"],
            "recipient": event["recipient"],
        }))

    # FRIEND REQUEST ACCEPTED NOTIFICATION
    async def friend_request_accepted(self, event):
        await self.send(text_data=json.dumps({
            "action": "friend_request_accepted",
            "sender": event["sender"],
            "recipient": event["recipient"],
        }))

    # FRIEND DECLINE REQUEST NOTIFICATION
    async def friend_decline_request(self, event):
        await self.send(text_data=json.dumps({
            "action": "decline_request",
            "sender": event["sender"],
            "recipient": event["recipient"],
        }))



    # NORMAL CHAT MESSAGE
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "action": "chat_message",
            "message": event["message"],
            "username": event["username"],     
        }))

    # PRIVATE CHAT MESSAGE
    async def chat_message_private(self, event):
        await self.send(text_data=json.dumps({
            "action": "chat_message_private",
            "message": event["message"],
            "username": event["username"],   
            "recipient": event["recipient"],
        }))

    # HANDELES SENDING DATA
    async def send_data(self, event):
        await self.send(text_data=json.dumps(event))

    # SAVES MESSAGES IN THE DATABASE
    @database_sync_to_async
    def save_message(self, sender_username, message, chat_room):
        sender = CustomUser.objects.get(username = sender_username)

        ChatMessages.objects.create(message = message, sender = sender, chat_room = chat_room)