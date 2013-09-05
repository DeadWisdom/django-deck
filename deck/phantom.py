import os, base64
from subprocess import Popen, PIPE

screenshotjs_path = os.path.abspath(os.path.join(__file__, '..', 'screenshot.js'))

def read_shot(path, src):
    src = base64.b64decode(src)
    return path, src

def take_shots(urls):
    env = os.environ.copy()
    env['URLS'] = "|".join(urls)
    p = Popen(["phantomjs", screenshotjs_path], stdout=PIPE, stderr=PIPE, env=env)
    stdout, stderr = p.communicate()
    parts = stdout.split("\n")
    while len(parts) > 1:
        yield read_shot(parts.pop(0), parts.pop(0))

