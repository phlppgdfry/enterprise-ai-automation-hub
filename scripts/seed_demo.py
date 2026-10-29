"""Add synthetic records through the real API. Re-running is idempotent; never erases data."""
import json
import urllib.request

BASE = 'http://127.0.0.1:5088'

def call(path, payload, token, key=None):
    headers = {'Authorization': 'Bearer '+token, 'Content-Type': 'application/json'}
    if key:
        headers['Idempotency-Key'] = key
    request = urllib.request.Request(BASE+path, data=json.dumps(payload).encode(), headers=headers)
    with urllib.request.urlopen(request, timeout=5) as response:
        return json.load(response)

fixtures = [
    ('Safety equipment · Ghent team','materials',185,'demo-alice',None),
    ('Site visit · travel reimbursement','expense',320,'demo-alice',None),
    ('Project planning · application access','access',0,'demo-alice',None),
    ('Replacement torque wrench','materials',148,'demo-alice','approved'),
    ('Client meeting · parking','expense',24.5,'demo-alice','approved'),
    ('Workshop consumables','materials',89,'demo-alice','rejected'),
    ('Field tablet · Antwerp team','materials',680,'demo-bob',None),
    ('Service desk · read-only access','access',0,'demo-bob',None),
]
for n, (title, category, amount, token, decision) in enumerate(fixtures):
    item = call('/requests', dict(title=title, category=category, amount=amount), token, 'showcase-v1-'+str(n))
    if decision and item['status'] == 'pending':
        call('/requests/'+item['id']+'/decision',dict(outcome=decision,
             reason='Synthetic demonstration review: '+('budget and purpose checked.' if decision=='approved' else 'item already available in stock.'),
             version=item['version']), 'demo-manager')
print('8 synthetic fixture requests ensured. No existing records removed.')
