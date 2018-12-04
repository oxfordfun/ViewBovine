import logging
import requests
import json

from flask import Flask, render_template, abort, request

myapp = Flask(__name__)

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
    eartag = data[7]

    req_movement = requests.get('http://192.168.7.30:5006/api/locations/{0}'.format(sample_name))
    movement_data = json.loads(req_movement.text)['data'][sample_name]
    print(movement_data)

    return render_template('map.template', 
        sample_name = sample_name,
        sample_id = my_guid,
        eartag = eartag,
        map_x = map_x,
        map_y = map_y,
        herd_id = 'asdf',
        other_guids=other_guids,
        movement_data=movement_data
        )
# @myapp.route('/sample/map/')
# def sample_map():
#     sample_name = request.args.get("sample_name")

myapp.run(debug=True)