from pywebpush import webpush
import json
import os

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "YOUR_VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "YOUR_VAPID_PUBLIC_KEY")

def send_push_notification(subscription, title, body):
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps({"title": title, "body": body}),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": "mailto:YourMail@example.com"} # This should be a mailto or a URL
        )
    except Exception as e:
        print(f"Error sending push notification: {e}")
