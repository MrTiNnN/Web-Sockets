from django.urls import path, re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    path('ws/chat/', ChatConsumer.as_asgi()),
    re_path(r'ws/user/(?P<username>\w+)/$', ChatConsumer.as_asgi()),
]
