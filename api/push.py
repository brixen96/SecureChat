from pywebpush import webpush
import json
import os

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "YOUR_VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "YOUR_VAPID_PUBLIC_KEY")

def send_push_notification(subscription, title, body):
    try:
        VAPID_MAILTO = os.getenv("VAPID_MAILTO", "mailto:admin@securechat.com")
        webpush(
            subscription_info=subscription,
            data=json.dumps({"title": title, "body": body}),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_MAILTO}
        )
        return True
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return False
