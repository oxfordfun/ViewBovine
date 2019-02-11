import logging
import requests
import json
import os

from flask import Flask, render_template, abort, request, redirect
import flask_login
from ldap3 import Connection

import git_utils

app = Flask(__name__)
app.secret_key = 'secret key'

login_manager = flask_login.LoginManager()
login_manager.init_app(app)
login_manager.login_view = '/login'

class User(flask_login.UserMixin):
    pass

@login_manager.user_loader
def user_loader(username):
    user = User()
    user.id = username
    return user

#Use enviornment variable to define the configuration
#for development in Windows:   set APP_SETTINGS='config.DevelopmentConfig'
#for testing in ubuntun: export APP_SETTINGS='config.TestingConfig'
#for production in ubuntun: export APP_SETTINGS='config.ProductionConfig'
app.config.from_object(os.environ['APP_SETTINGS'])

version = git_utils.git_describe('.')

@app.context_processor
def inject_globals():
    return dict(version=version)

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

def call_api(kind, path, return_type='json', limit=80):
    if kind == 'tree':
        host = app.config['TREE_SERVER']
    elif kind == 'map':
        host = app.config['MAP_SERVER']
    else:
        abort(500, description="unknown api host: {0}".format(kind))

    logger.debug('{0} => {1}{2}'.format(kind, host, path)[:limit])

    try:
        req_api = requests.get(host + path)
    except Exception as e:
        abort(500, description=e)

    if req_api.status_code != 200:
        abort(500, description="api call to {0} returned code {1}, content: {2}".format(host + path, req_api.status_code, req_api.text))

    logger.debug('{0} <= {1}'.format(kind, req_api.text)[:limit])

    if return_type == 'json':
        try:
            ret = req_api.json()
            return ret
        except Exception as e:
            abort(500, description="couldn't parse api response to {0} as json: {1}".format(host + path, req_api.text))

    else:
        return req_api.text

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.template')
    else:
        form_username = request.form['username']
        form_password = request.form['password']

        if app.config['AUTH']:
            '''
            Check user authorization
            '''
            ldap_host = '192.168.7.16'
            conn = Connection(ldap_host,
                              user=form_username,
                              password=form_password,
                              read_only=True)
            if not conn.bind():
                logger.warning("invalid credentials for ldap user {0}".format(form_username))
                return redirect('/')

        '''
        User is authorized
        '''
        logger.info("ldap user {0} logged in".format(form_username))

        user = User()
        user.id = form_username
        flask_login.login_user(user)

        return redirect('/')

@app.route('/logout')
def logout():
    flask_login.logout_user()
    return redirect('/')

@app.route('/')
@flask_login.login_required
def home():
    return render_template('home.template')

@app.route('/sample')
@flask_login.login_required
def sample():
    last_updates = call_api('map', '/api/describe')
    return render_template('sample.template', last_updates = last_updates)

@app.route('/sample/map/')
@flask_login.login_required
def sample_map():
    sample_name = request.args.get("sample_name")
    if len(sample_name) == 0:
        last_updates = call_api('map', '/api/describe')
        return render_template('sample.template', last_updates = last_updates)
    else:
        names_guids = call_api('map', '/api/lookup/{0}'.format(sample_name))
        my_guid = "Not found"
        other_guids = list()

        if names_guids:
            my_guid = names_guids[0][0]
            sample_name = names_guids[0][1]
            for guid,_ in names_guids[1:]:
                other_guids.append(guid)
        data = call_api('map', '/coordinates2/{0}'.format(sample_name))
        movement_data = dict()
        if data:
            map_x = data[0][2]
            map_y = data[0][3]
            herd_id = data[0][4]
            eartag = data[0][7]
            req_movement = call_api('map', '/api/locations/{0}'.format(sample_name))
            if req_movement['data']:
                movement_data = req_movement['data'][sample_name]
        else:
            map_x = 'Not found'
            map_y = 'Not found'
            herd_id = 'Not found'
            eartag = 'Not found'


    return render_template('map.template',
                           sample_name = sample_name,
                           sample_guid = my_guid,
                           eartag = eartag,
                           map_x = map_x,
                           map_y = map_y,
                           herd_id = herd_id,
                           other_guids = other_guids,
                           movement_data = movement_data,
                           title = 'Sample and Herd'
    )

@app.route('/sample/neighbour/')
@flask_login.login_required
def sample_neighbour():
    my_guid = request.args.get("sample_guid")
    my_distance = request.args.get('distance')
    my_quality = request.args.get('quality')

    neighbours_dict = dict()
    tbl = list()
    cohab = dict()
    cohab_figures = dict()

    # number of unique herds
    num_herds = 0
    # number of members of the herd with the parent sample name
    same_herd_samples = 0

    guid_name_map = call_api('map', '/api/lookup/{0}'.format(my_guid))

    if not guid_name_map:
        abort(500, description='Couldn\'t find data for sample oxford id: \'{0}\'.'.format(my_guid))

    sample_name = guid_name_map[0][1]
    data = call_api('map', '/coordinates2/{0}'.format(sample_name))[0]

    map_x = data[2]
    map_y = data[3]
    herd_id = data[4]
    eartag = data[7]

    movement_data = dict();
    req_movement = call_api('map', '/api/locations/{0}'.format(sample_name))
    if req_movement['data']:
        movement_data = req_movement['data'][sample_name]

    if my_distance and my_quality:
        cohab = call_api('map', '/api/locations_cohabit_filter/{0}/{1}'.format(sample_name, my_distance), limit=2000)['data']
        for k in cohab:
            cohab_figures[k] = call_api('map', '/api/locations_cohabit_filter_figure/{0}/{1}/{2}'.format(
                sample_name, my_distance, k), return_type='text', limit=2000)

        # [neighbour, distance]
        query_fmt = "/neighbours2/{0}?distance={1}&quality=0.{2}&reference=R00000039"
        neighbours = call_api('tree', query_fmt.format(my_guid, my_distance, my_quality))


        # get sample names
        if neighbours:
            neighbour_guids = [x[0] for x in neighbours]
            neighbour_guids = ",".join(neighbour_guids)
            neighbour_guids_names = call_api('map', '/api/lookup/{0}'.format(neighbour_guids))

            # build dict name -> distance
            for guid,name in neighbour_guids_names:
                for guid2,distance in neighbours:
                    if guid == guid2:
                        neighbours_dict[name] = distance
                        break

            # get table
            neighbour_names = [x[1] for x in neighbour_guids_names]
            neighbour_names = ",".join(neighbour_names)
            tbl = call_api('map', '/coordinates2/{0}'.format(neighbour_names))
            # unique by sample name
            tbl = list({ row[0]:row for row in tbl }.values())

            seen_herds = list()
            for row in tbl:
                if row[4] not in seen_herds:
                    num_herds = num_herds + 1
                    seen_herds.append(row[4])
                if row[4] == herd_id:
                    same_herd_samples = same_herd_samples + 1

    # do coordinate lookup on names
    return render_template('neighbour.template',
                           map_x = map_x,
                           map_y = map_y,
                           eartag = eartag,
                           herd_id = herd_id,
                           sample_guid = my_guid,
                           sample_name = sample_name,
                           neighbours = tbl,
                           neighbours_dict = neighbours_dict,
                           cohab = cohab,
                           cohab_figures = cohab_figures,
                           title = 'Genetic Related Samples',
                           num_herds = num_herds,
                           same_herd_samples = same_herd_samples,
                           movement_data = movement_data
    )

@app.route('/samplelist')
@flask_login.login_required
def samplelist():
    sample_list = call_api('map', '/api/coordinates')
    return render_template('samplelist.template', sample_list=sample_list)

@app.route('/herd')
@flask_login.login_required
def herd():
    herd_id = request.args.get('herd_id')
    cph = list()
    import math
    if herd_id != None:
        if len(herd_id) == 11: #Search CPHH
            herd_matrix = call_api('map', '/herdmatrix/{0}'.format(herd_id))
            n = math.sqrt(len(herd_matrix))
            cph = [[herd_id, herd_matrix, int(n)]]
        elif len(herd_id) == 9: #Search CPH
            herd_matrix_dict = call_api('map', '/api/herdmatrix/cph/{0}'.format(herd_id))
            for k, v in herd_matrix_dict.items():
                n = math.sqrt(len(v))
                cph.append([k, v, int(n)])
    return render_template('herd.template', cph=cph )

import functools

@functools.lru_cache(maxsize=None)
def lookup(names):
    return call_api('map', '/coordinates2/{0}'.format(names))

def get_cluster_data(clusters_list):
    clusters = list()
    sample_total = 0
    for cluster in clusters_list:
        sample_total = sample_total + len(cluster)
        names = ",".join(cluster)
        tbl = lookup(names)
        cluster_item = [[row[0], row[2], row[3], row[7], row[4]] for row in tbl]
        clusters.append(cluster_item)
    return clusters, sample_total

@app.route('/cluster')
@flask_login.login_required
def cluster():
    cluster_snp = request.args.get('cluster_snp')
    if cluster_snp is not None and int(cluster_snp) >= 0 and int(cluster_snp) <= 20:
        clusters_list = call_api('map', '/clusters/{0}'.format(cluster_snp))
        clusters, sample_total = get_cluster_data(clusters_list)
        return render_template('cluster.template', clusters = clusters, cluster_snp=cluster_snp, sample_total=sample_total)
    else:
        return render_template('cluster.template', cluster_snp=20)

@app.route('/subcluster')
@flask_login.login_required
def subcluster():
    sample_name = request.args.get('sample_name')
    distance1 = request.args.get('distance1')
    distance2 = request.args.get('distance2')
    if sample_name and distance1 and distance2:
        clusters_list = call_api('map', '/clusters2/{0}/{1}/{2}'.format(sample_name,distance1,distance2))
        clusters, sample_total = get_cluster_data(clusters_list)
        return render_template('subcluster.template', clusters = clusters,sample_total = sample_total, sample_name = sample_name, distance_cluster = distance1, distance_subcluster = distance2)
    else:
        if sample_name:
            return render_template('subcluster.template', sample_name = sample_name, distance_cluster = 6, distance_subcluster = 6)
        else:
            return render_template('subcluster.template', distance_cluster = 6, distance_subcluster = 6)

@app.route('/about')
@flask_login.login_required
def about():
    return render_template('about.template')

if __name__ == "__main__":
    app_port = app.config['APP_PORT']
    app.run(host='0.0.0.0', port=app_port)
