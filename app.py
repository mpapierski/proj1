import os
import random
import glob
from flask import Flask, json, abort, render_template, request
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
app.config['MONGODB_HOST'] = '10.254.31.115'
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
  title = db.StringField(max_length=100)
  content = db.DictField()

class MapData(db.Document):
  map_name = db.StringField()
  start = db.ListField() # (x, y)
  tiles = db.DynamicField()

# Setup Flask-Security
user_datastore = MongoEngineUserDatastore(db, User, Role)
#room_datastore = MongoEngineUserDatastore(db, )
security = Security(app, user_datastore)

# Views
@app.route('/')
def home():
  return render_template('index.html')

@app.route('/api/room/', methods=['GET'])
def get_room_list():
  return Room.objects.to_json()

@app.route('/api/room/', methods=['POST'])
def post_room_list():
  data = request.json
  room = Room(title=data['title'], content=data['content'])
  room.save()
  return room.to_json()

@app.route('/api/room/<title>/', methods=['GET'])
def get_room(title):
  rooms = Room.objects(title=title)
  if rooms: return rooms[0].to_json()
  abort(404)

@app.route('/api/room/<title>/', methods=['PUT'])
def put_room(title):
  rooms = Room.objects(
    title=title)
  if not rooms:
    abort(404)
  room = rooms[0]
  room.content = request.json['content']
  room.save()
  return room.to_json()

@app.route('/api/maps/random/', methods=['GET'])
def get_random_map():
  if not Room.objects:
    abort(404)
  m = random.choice(MapData.objects)
  return m.to_json()

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

@manager.command
def import_maps():
  for filename in glob.glob('maps/*.json'):
    with open(filename) as input_file:
      v = json.loads(input_file.read())
      mapdata, created = MapData.objects.get_or_create(
        map_name=v['map_name'],
        defaults={
          'start': v['start'],
          'tiles': v['tiles']
        })
      mapdata.start = v['start']
      mapdata.tiles = v['tiles']
      mapdata.save()

if __name__ == '__main__':
  manager.run()