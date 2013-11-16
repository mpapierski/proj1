import json
from flask import Flask, request


app = Flask(__name__, static_folder='frontend/app/', static_url_path='/static')

things = None

@app.route('/')
def get():
    if things is None:
        return ''
    return json.dumps(things)

@app.route('/', methods=['POST'])
def save():
    global things
    things = request.json
    return 'foo'

app.run(debug=True)
