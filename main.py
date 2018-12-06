import logging
import requests
import json

from flask import Flask, render_template, abort, request

myapp = Flask(__name__)

def setup_logging():
    #
    # setup global logger
    #
    glogger = logging.getLogger("fan_logger")
    glogger.setLevel(logging.DEBUG)
    c_handler = logging.StreamHandler()
    c_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    glogger.addHandler(c_handler)

setup_logging()
logger = logging.getLogger("fan_logger")
    
def call_api(kind, path):
    if kind == 'tree':
        host = 'http://192.168.7.30:5008'
    if kind == 'map':
        host = 'http://192.168.7.30:5006'

    logger.debug('=> {0}{1}'.format(host, path)[:80])

    try:
        req_api = requests.get(host + path)
    except Exception as e:
        abort(500, description=e)

    logger.debug('<= {0}'.format(req_api.text)[:80])

    return req_api.json()

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


    req_coord = requests.get('http://192.168.7.30:5006/coordinates2/{0}'.format(sample_name))
    data = json.loads(req_coord.text)[0]

    sample_name = data[0]
    map_x = data[2]
    map_y = data[3]
    herd_id = data[4]
    eartag = data[7]

    req_movement = requests.get('http://192.168.7.30:5006/api/locations/{0}'.format(sample_name))
    movement_data = json.loads(req_movement.text)['data'][sample_name]

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

    neighbours_dict = dict()
    tbl = list()

    guid_name_map = call_api('tree', '/lookup/{0}'.format(my_guid))
    logger.debug('map: {0}'.format(guid_name_map))
    sample_name = guid_name_map[0][1]
    data = call_api('map', '/coordinates2/{0}'.format(sample_name))[0]
    logger.debug('data: {0}'.format(data))

    map_x = data[2]
    map_y = data[3]
    herd_id = data[4]
    eartag = data[7]

    if my_distance and my_quality:
        # [neighbour, distance]
        query_fmt = "/neighbours2/{0}?distance={1}&quality=0.{2}&reference=R00000039"
        neighbours = call_api('tree', query_fmt.format(my_guid, my_distance, my_quality))

        # get sample names
        neighbour_guids = [x[0] for x in neighbours]
        neighbour_guids = ",".join(neighbour_guids)
        neighbour_guids_names = call_api('tree', '/lookup/{0}'.format(neighbour_guids))

        # build dict name -> distance
        for guid,name in neighbour_guids_names:
            for guid2,distance in neighbours:
                if guid == guid2:
                    neighbours_dict[name] = distance
                    break
        logger.debug('neighbours_dict: {0}'.format(neighbours_dict))

        # get table
        neighbour_names = [x[1] for x in neighbour_guids_names]
        neighbour_names = ",".join(neighbour_names)
        tbl = call_api('map', '/coordinates2/{0}'.format(neighbour_names))

    # do coordinate lookup on names
    return render_template('neighbour.template',
                           map_x = map_x,
                           map_y = map_y,
                           eartag = eartag,
                           herd_id = herd_id,
                           sample_guid = my_guid,
                           sample_name = sample_name,
                           neighbours = tbl,
                           neighbours_dict = neighbours_dict
    )

@myapp.route('/herd')
def herd():
    import herd
    return herd.herd()

@myapp.route('/cluster')
def cluster():
    return render_template('cluster.template')

@myapp.route('/subcluster')
def subcluster():
    return render_template('subcluster.template')

@myapp.route('/about')
def about():
    return render_template('about.template')

myapp.run()
