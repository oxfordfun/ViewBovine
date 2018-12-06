from flask import request, render_template
from main import call_api

def herd():
    herd_id = request.args.get('herd_id')

    herd_matrix = call_api('map', '/herdmatrix/{0}'.format(herd_id))

    return render_template('herd.template', herd_matrix=herd_matrix)