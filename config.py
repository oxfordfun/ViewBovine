import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    APP_PORT = 5080
    TREE_SERVER = 'http://192.168.7.30:5008'
    MAP_SERVER = 'http://192.168.7.30:5006'


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    APP_PORT = 80
    TREE_SERVER = 'http://127..0.0.1:5008'
    MAP_SERVER = 'http://127.0.0.1:5006'


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False