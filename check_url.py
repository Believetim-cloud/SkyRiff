import requests

url = 'https://videos-jp.ss3.life/az/files/00000000-c670-7285-8999-87bd7490afad%2Fraw?se=2026-01-01T00%3A00%3A00Z&sp=r&sv=2024-08-04&sr=b&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-12-26T01%3A09%3A08Z&ske=2026-01-02T01%3A14%3A08Z&sks=b&skv=2024-08-04&sig=3ywp52CyemiW86cMrqtuThAJxm805SoacbH9sKV%2Bw5w%3D&ac=oaisdsorprnorthcentralus'

try:
    r = requests.head(url, timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    print(f"Content-Length: {r.headers.get('Content-Length')}")
    print(f"Location: {r.headers.get('Location')}")
except Exception as e:
    print(f"Error: {e}")
