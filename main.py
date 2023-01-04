#!/usr/bin/python3

import os

from flask import Flask, render_template, request
from flask_cors import CORS
import logging
import json
from pprint import pprint
import requests
import platform

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
    if platform.machine() == 'x86_64':
        config_folder = HOME_DIR + "/.config/m2-kiosk-app/"
    else:
        config_folder = "/var/www/m2-kiosk-web/.config/"

    config_file = "config.json"
    f = open(config_folder + config_file)
    config_data = json.load(f)
    f.close()
    create_config = False
except FileNotFoundError:
    print("Config file not found: " + config_folder + config_file)
    create_config = True

if create_config:
    try:
        print("Creating new config file")
        print(config_folder)
        os.makedirs(config_folder, exist_ok=True)
    except OSError as error:
        print(error)

    try:
        print("Reading config file")
        f = open("config_template.json", "r")
        template_data = f.read()
        f.close()
        print(template_data)
    except FileNotFoundError:
        print("Template file not found")

    try:
        f = open(config_folder + config_file, "w")
        f.write(template_data)
        f.close()
    except OSError as e:
        print(e)

    try:
        f = open(config_folder + config_file)
        config_data = json.load(f)
        f.close()
    except OSError as e:
        print(e)

print(config_data)


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

            network_type = json_data['network_type']
            transaction_id = json_data['transaction_id']
            wallet_address = json_data['wallet_address']
            amount = json_data['amount']

            json_data = {
                "network_type": network_type,
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
    print('==== save_config_data() ======')
    if request.method == 'POST':
        print('save')
        form_data = request.form.to_dict()
        pprint(form_data)

        try:
            f = open(config_folder + config_file)
            config_data = json.load(f)
            f.close()
        except Error as e:
            print(e)

        config_data['cardano']['network_type'] = form_data['network_type']
        config_data['cardano']['testnet_wallet_address'] = form_data['testnet_wallet_address']
        config_data['cardano']['mainnet_wallet_address'] = form_data['mainnet_wallet_address']
        config_data['globals']['decimal_seperator'] = form_data['decimal_seperator']

        with open(config_folder + config_file, 'w') as f:
            json.dump(config_data, f, ensure_ascii=False, indent=4)

    return render_template('index.html', config_data=config_data)


# host='0.0.0.0' to make flask available on the local network
if __name__ == "__main__":
    #    app.run(host='0.0.0.0', port=5000)
    app.run()
