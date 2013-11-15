import os
from flask import Flask, json, abort, render_template
from flask.ext.mongoengine import MongoEngine
from flask.ext.security import Security, MongoEngineUserDatastore, \
    UserMixin, RoleMixin, login_required
from flask.ext.script import Manager, Server, prompt, prompt_pass

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
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'super-secret'

# MongoDB Config
app.config['MONGODB_DB'] = 'proj'
app.config['MONGODB_HOST'] = 'localhost'
app.config['MONGODB_PORT'] = 27017

# Flask-Security
app.config['SECURITY_REGISTERABLE'] = True

db = MongoEngine(app)

class Role(db.Document, RoleMixin):
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)

class User(db.Document, UserMixin):
    email = db.StringField(max_length=255)
    password = db.StringField(max_length=255)
    active = db.BooleanField(default=True)
    confirmed_at = db.DateTimeField()
    roles = db.ListField(db.ReferenceField(Role), default=[])

# Setup Flask-Security
user_datastore = MongoEngineUserDatastore(db, User, Role)
security = Security(app, user_datastore)

# Views
@app.route('/')
def home():
  return render_template('index.html')

@app.route('/api/server/')
def get_server_list():
  return json.dumps(SERVER_LIST)

@app.route('/api/server/<int:server_id>/')
def get_server_by_id(server_id):
  for server in SERVER_LIST:
    if server['id'] == server_id:
      return json.dumps(server)
  abort(404)

# Manager

manager = Manager(app)

manager.add_command("runserver", Server(
    use_debugger=True,
    use_reloader=True,
    host='0.0.0.0'))

@manager.command
def create_user():
  email = prompt('E-mail')
  password = prompt_pass('Password')
  user_datastore.create_user(email=email, password=password)

@manager.command
def list_servers():


if __name__ == '__main__':
  manager.run()