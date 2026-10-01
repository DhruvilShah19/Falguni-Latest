import firebase_admin
from firebase_admin import credentials, firestore
import json

try:
    cred = credentials.Certificate("../../admin_web/lib/falguni-firebase.json")
except:
    try:
        cred = credentials.Certificate("../../admin_app/falguni-firebase.json")
    except:
        print("No creds found")
        exit(1)

firebase_admin.initialize_app(cred)
db = firestore.client()

orders = db.collection('Orders').order_by('orderID', direction=firestore.Query.DESCENDING).limit(5).stream()
for o in orders:
    data = o.to_dict()
    print(f"Order {data.get('orderID')}: total={data.get('total')}, subTotal={data.get('subTotal')}, payment={data.get('paymentStatus')}")
