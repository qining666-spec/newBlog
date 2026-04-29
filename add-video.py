import requests
import json

url = 'http://localhost:3001/api/videos'
data = {
    'url': '/uploads/videos/我给全校师生朗诵《病梅馆记》，引发轰动！！.mp4',
    'title': '我给全校师生朗诵《病梅馆记》，引发轰动！！'
}

resp = requests.post(url, json=data)
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
