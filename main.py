from flask import Flask, render_template, abort, request
import logging

myapp = Flask(__name__)

@myapp.route('/hello/<names>')
def hello(names):
    if request.args.get('hide') == 'yes':
        abort(404)

    return render_template('hello.template', names=names.split(','))

myapp.run(debug=True)