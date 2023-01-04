#!/usr/bin/python3

import os

from flask import Flask, render_template, request
from flask_cors import CORS
import logging
import json
from pprint import pprint
import requests

app = Flask(__name__)
CORS(app)

logging.getLogger('flask_cors').level = logging.DEBUG

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))  # This is your Project Root

app.debug = True

f = open(ROOT_DIR + '/m2_kiosk_web_config.json')
config_data = json.load(f)
f.close()

HOME_DIR = os.path.expanduser('~')
print(HOME_DIR)

try:
    config_folder = HOME_DIR + "/.config/m2-kiosk-app/"
    config_file = "config.json"
    f = open(config_file)
    config_data = json.load(f)
    f.close()
except FileNotFoundError:
    print("Config file not found: " + config_folder + config_file)
    print("Creating new config file")

    try:
        os.mkdir(config_folder)
    except OSError as error:
         
         print(error)

    try:
        f = open("config_template.json", "r")
        template_data = f.read()
        f.close()

        f = open(config_folder + config_file, "w")
        f.write(template_data)
        f.close()

    except FileNotFoundError:
        print("Template file not found")
        quit()


def send_kiosk_request(request_type, data):
    # print(data)
    url = "http://localhost:9090" + request_type
    r = requests.post(url, json=data)
    print(r.status_code)


@app.route('/', methods=['GET', 'POST'])
def m2_paypad_web_app():

    print(request.method)
    # print(request.form.to_dict())
    if request.method == 'POST':
        print('POST request')
        data = request.form.to_dict()
        print()
        pprint(data)
        print()

        if data['request-type'] == 'sendPayRequest':
            print('Pay request')
            json_data = json.loads(data['payment-data'])
            pprint(json_data)
            transaction_id = json_data['transaction_id']
            wallet_address = json_data['wallet_address']
            amount = json_data['amount']
            json_data = {
                "transaction_id": transaction_id,
                "wallet_address": wallet_address,
                "amount": amount}

            send_kiosk_request('/payment-request', json_data)

        elif data['request-type'] == 'cancelPayRequest':
            json_data = {'request-type': 'cancelPayRequest'}
            send_kiosk_request('/clear-display', json_data)
            pass

        elif data['request-type'] == 'getStatus':
            json_data = {}
            send_kiosk_request('/payment-status', json_data)
            pass

    return render_template('index.html', config_data=config_data)


@app.route('/save-config-data', methods=['GET', 'POST'])
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
