import os
import subprocess
import shlex

def git_describe(directory):
    '''
    get the git version of the repo
    '''
    old = os.getcwd()
    os.chdir(directory)
    cmd = "git describe --tags --always --dirty --match \"[0-9A-Z]*.[0-9A-Z]*\""
    version = subprocess.check_output(shlex.split(cmd)).decode('utf-8').strip()
    os.chdir(old)
    return version
