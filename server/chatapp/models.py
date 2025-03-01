from user.models import CustomUser
from django.db import models

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]
    
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_requests")
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_requests")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    timestamp = models.DateTimeField(auto_now_add=True)