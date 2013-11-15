import os
from flask import Flask, json, abort, render_template
from flask.ext.mongoengine import MongoEngine
from flask.ext.security import Security, MongoEngineUserDatastore, \
    UserMixin, RoleMixin, login_required
from flask.ext.script import Manager, Server, prompt, prompt_pass

app = Flask(__name__, static_folder='frontend/app', static_url_path='/static')
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

class Room(db.Document):
  owner = db.ReferenceField(User, verbose_name='Owner', required=True)
  title = db.StringField(max_length=100)
  def to_object(self):
    return {
      'owner': self.owner.email,
      'title': self.title,
    }

# Setup Flask-Security
user_datastore = MongoEngineUserDatastore(db, User, Role)
#room_datastore = MongoEngineUserDatastore(db, )
security = Security(app, user_datastore)

# Views
@app.route('/')
def home():
  return render_template('index.html')

@app.route('/api/room/')
def get_room_list():
  objects = []
  for room in Room.objects:
    objects.append(room.to_object())
  return json.dumps(objects)

@app.route('/api/room/<server_id>/')
def get_server_by_id(server_id):
  obj = Room.objects(_id=server_id)[0]
  return json.dumps(obj.to_object())
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
def create_room():
  owner = 'michal@papierski.net'
  obj = User.objects(email=owner)[0]
  assert obj is not None
  title = prompt('Title')
  room = Room(owner=obj,title=title)
  room.save()

if __name__ == '__main__':
  manager.run()