#!/usr/bin/python3

import os 

from flask import Flask, render_template, request
from flask_cors import CORS
import logging
import json
from pprint import pprint

app = Flask(__name__)
CORS(app)

logging.getLogger('flask_cors').level = logging.DEBUG

ROOT_DIR = os.path.dirname(os.path.abspath(__file__)) # This is your Project Root

app.debug = True

f = open(ROOT_DIR + '/m2_kiosk_web_config.json')
config_data = json.load(f)
f.close()

@app.route('/')
def m2_paypad_web_app():
    return render_template('index.html', config_data=config_data)

@app.route('/save-config-data', methods=['GET','POST'])
def save_config_data():
    if request.method == 'POST':
        print('save')
        config_data = request.form.to_dict()
        pprint(config_data)

        with open('m2_kiosk_web_config.json', 'w') as f:
            json.dump(config_data, f, ensure_ascii=False, indent=4)

    return render_template('index.html', config_data=config_data)

# host='0.0.0.0' to make flask available on the local network
if __name__ == "__main__":
#    app.run(host='0.0.0.0', port=5000)
    app.run()

