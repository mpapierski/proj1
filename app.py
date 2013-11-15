import os
from flask import Flask, json, abort


SERVER_LIST = [
{
  'id': 1,
  'title': 'Room 1',
  'keys': ['key1', 'key2'],
}, {
  'id': 2,
  'title': 'Room 2',
  'key': 'key2'
}, {
  'id': 3,
  'title': 'Room 3',
  'key': 'key3'
}]

app = Flask(__name__)
app.debug = os.getenv('DEBUG')
app.config["MONGODB_SETTINGS"] = {'DB': "proj"}

@app.route('/')
def index():
  return 'hello world'

@app.route('/api/server/')
def get_server_list():
  return json.dumps(SERVER_LIST)

@app.route('/api/server/<int:server_id>/')
def get_server_by_id(server_id):
  for server in SERVER_LIST:
    if server['id'] == server_id:
      return json.dumps(server)
  abort(404)

if __name__ == '__main__':
  app.run()