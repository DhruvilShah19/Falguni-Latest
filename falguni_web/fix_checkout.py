with open('app/checkout/page.tsx', 'r') as f:
    content = f.read()

s1 = """    if (isPickup) {
      if (!pickupContact.phone || !pickupContact.phone.trim()) {
        alert('Please provide a mobile phone number for store pickup verification.');
        return;
      }
    } else {
      if (!selectedAddress) {
        alert('Please select or add a delivery address to proceed.');
        return;
      }
    }"""
r1 = """    const finalPhone = isPickup 
      ? pickupContact.phone 
      : (selectedAddress?.phone || userDoc?.phone || (userDoc as any)?.Phone || '');
    
    if (!finalPhone || !finalPhone.trim() || finalPhone.length < 7) {
      alert('A valid phone number is mandatory for all orders. Please update your profile or address with a phone number to continue.');
      return;
    }

    if (isPickup) {
      if (!pickupContact.phone || !pickupContact.phone.trim()) {
        alert('Please provide a mobile phone number for store pickup verification.');
        return;
      }
    } else {
      if (!selectedAddress) {
        alert('Please select or add a delivery address to proceed.');
        return;
      }
    }"""
content = content.replace(s1, r1)

with open('app/checkout/page.tsx', 'w') as f:
    f.write(content)
