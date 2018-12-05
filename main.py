import logging
import requests
import json

from flask import Flask, render_template, abort, request

myapp = Flask(__name__)

def call_api(kind, path):
    if kind == 'tree':
        host = 'http://192.168.7.30:5008'
    if kind == 'map':
        host = 'http://192.168.7.30:5006'

    logging.warning('=> {0}{1}'.format(host, path))

    try:
        req_api = requests.get(host + path)
    except Exception as e:
        abort(500, description=e)

    logging.warning('<= {0}'.format(req_api.text)[80:])

    return req_api.text

def get_neighbours(guid, distance=6, quality=80):
    ret = call_api('tree', '/neighbours2/{0}?reference=R00000039&distance={1}&quality=0.8'.format(guid, distance, quality))
    return ret

@myapp.route('/')
def home():
    return render_template('home.template')

@myapp.route('/sample')
def sample():
    return render_template('sample.template')

@myapp.route('/sample/map/')
def sample_map():
    sample_name = request.args.get("sample_name")

    req_lookup = requests.get('http://192.168.7.30:5008/lookup/{0}'.format(sample_name))
    names_guids = json.loads(req_lookup.text)

    my_guid = names_guids[0][0]
    sample_name = names_guids[0][1]
    other_guids = list()
    for guid,_ in names_guids[1:]:
        other_guids.append(guid)

    print(my_guid)

    req_coord = requests.get('http://192.168.7.30:5006/coordinates2/{0}'.format(sample_name))
    data = json.loads(req_coord.text)[0]

    sample_name = data[0]
    map_x = data[2]
    map_y = data[3]
    herd_id = data[4]
    eartag = data[7]

    req_movement = requests.get('http://192.168.7.30:5006/api/locations/{0}'.format(sample_name))
    movement_data = json.loads(req_movement.text)['data'][sample_name]
    print(movement_data)

    return render_template('map.template', 
        sample_name = sample_name,
        sample_guid = my_guid,
        eartag = eartag,
        map_x = map_x,
        map_y = map_y,
        herd_id = herd_id,
        other_guids = other_guids,
        movement_data = movement_data
        )

@myapp.route('/sample/neighbour/')
def sample_neighbour():
    my_guid = request.args.get("sample_guid")
    my_distance = request.args.get('distance')
    my_quality = request.args.get('quality')
    print(my_guid)
    if my_distance and my_quality:
        neighbours = get_neighbours(my_guid, my_distance, my_quality)
    else:
        neighbours = list()

    logging.warning(neighbours)
    coordinate_query = ",".join([neighbour[1] for neighbour in neighbours])
    data = call_api('map', '/coordinates2/{0}'.format(coordinate_query))
    logging.warning(data)

    return render_template('neighbour.template',
        sample_guid = my_guid,
        sample_name = "asdf",
        neighbours = neighbours
    )

myapp.run()