#!/usr/bin/env python3

#
# This file is part of the m2-kiosk-web distribution (https://github.com/M2tec/m2_kiosk_web).
# Copyright (c) 2023 Maarten Menheere.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

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

app.debug = True

def send_kiosk_request(request_type, data="none"):
    # print(data)
    print('\n======= Send kiosk request ====== ' + request_type + ' =====')

    url = "http://localhost:9090" + request_type
    response = requests.post(url, json=data)
    print(response.status_code)
    return response


@app.route('/', methods=['GET', 'POST'])
def m2_paypad_web_app():

    print('\n======= Render index ====== ' + request.method)
    # print(request.form.to_dict())
    if request.method == 'POST':
        # print('POST request')
        data = request.form.to_dict()

        print(data)


        if data['request-type'] == 'sendPayRequest':
            print('Pay request')
            json_data = json.loads(data['payment-data'])
            pprint(type(json_data))
            pprint(json_data)
            
            send_kiosk_request('/payment-request', json_data)

        elif data['request-type'] == 'cancelPayRequest':
            json_data = {'request-type': 'cancelPayRequest'}
            send_kiosk_request('/clear-display', json_data)
            pass

        elif data['request-type'] == 'getStatus':
            json_data = {}
            send_kiosk_request('/payment-status', json_data)
            pass

    response = send_kiosk_request('/load-configuration')
    config_data = response.json()
    print("----Load configuration----")
    print(config_data)
    print("----Load configuration----")
     
#    config_data = get_config()
#    print(config_data)
    return render_template('index.html', config_data=config_data)


@app.route('/save-config-data', methods=['GET', 'POST'])
def save_config_data():
    print('\n==== save_config_data() ======')
    if request.method == 'POST':
        print('save')
        form_data = request.form.to_dict()        
        pprint(form_data)
        
        network_type = request.form.get('network_type')
        print(network_type)
        if network_type == None: 
            form_data['network_type'] = 'testnet'
        
        response = send_kiosk_request('/load-configuration')
        config_data = response.json()


        config_data['cardano']['network_type'] = form_data['network_type']
        config_data['cardano']['testnet_wallet_address'] = form_data['testnet_wallet_address']
        config_data['cardano']['networks'][0]['selected_token'] = form_data['testnet_selected_token']       
        
        config_data['cardano']['mainnet_wallet_address'] = form_data['mainnet_wallet_address']
        config_data['cardano']['networks'][1]['selected_token'] = form_data['mainnet_selected_token']

        config_data['globals']['locale_setting'] = form_data['locale_setting']

        send_kiosk_request('/save-configuration', config_data)

    #config_data = get_config()
    #print(config_data)
    return render_template('index.html', config_data=config_data)


# host='0.0.0.0' to make flask available on the local network
if __name__ == "__main__":
    #    app.run(host='0.0.0.0', port=5000)
    app.run()
