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
from werkzeug.utils import secure_filename
import base64


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/home/maarten/m2paypad/m2-kiosk-web/static'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


logging.getLogger('flask_cors').level = logging.DEBUG

app.debug = True

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def base64_encode(string):
    """
    Removes any `=` used as padding from the encoded string.
    """
    encoded = base64.urlsafe_b64encode(string)
    return encoded.rstrip(b"=").rstrip(b"\n")


def base64_decode(string):
    """
    Adds back in the required padding before decoding.
    """
    padding = 4 - (len(string) % 4)
    string = string + (b"=" * padding)
    return base64.urlsafe_b64decode(string)


def send_kiosk_request(request_type, json1=None, image=None):
    # print(data)
    print('\n======= Send kiosk request ====== ' + request_type + ' =====')
    url = "http://localhost:9090" + request_type

    if image:
        filename = json1['filename']
        response = requests.post(url, files={'file' : (filename, image)})
    else:
        response = requests.post(url, json=json1)
    
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
    print(json.dumps(config_data, indent=2))
    print("\n\n")

    return render_template('index.html', config_data=config_data)

@app.route('/config', methods=['GET', 'POST'])
def config_page():

    response = send_kiosk_request('/load-configuration')
    config_data = response.json()
    # print("----Load configuration----")
    # print(json.dumps(config_data, indent=2))
    # print("\n\n")
     
    return render_template('config.html', config_data=config_data)


@app.route('/loyalty', methods=['GET', 'POST'])
def loyalty_page():

    response = send_kiosk_request('/load-configuration')
    config_data = response.json()
    # print("----Load configuration----")
    # print(json.dumps(config_data, indent=2))
    # print("\n\n")
     
    return render_template('loyalty.html', config_data=config_data)


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
            form_data['network_type'] = 'Preprod'
        
        response = send_kiosk_request('/load-configuration')
        config_data = response.json()


        config_data['cardano']['network_type'] = form_data['network_type']

        print()
        print(form_data)
        print()

        cardano_networks = list(config_data['cardano']['networks'].keys())
        print(cardano_networks)

        for network in cardano_networks:
            config_data['cardano']['networks'][network]['selected_token']
            config_data['cardano']['networks'][network]['wallet_address'] = form_data[network + '_wallet_address']

        config_data['globals']['locale_setting'] = form_data['locale_setting']

        send_kiosk_request('/save-configuration', config_data)

    #config_data = get_config()
    #print(config_data)
    return render_template('index.html', config_data=config_data)


@app.route('/save-logo-data', methods=['GET', 'POST'])
def save_logo_data():
    print('\n==== save_logo_data() ======')
    if request.method == 'POST':
    
        print(request.files)
        
        if 'file' not in request.files:
            print('No file part')
            pass
        
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            print('No selected file')
            pass
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        print('save')
        form_data = request.form.to_dict()        
        pprint(form_data)
        
        
        response = send_kiosk_request('/load-configuration')
        config_data = response.json()

        f = request.files["file"]
        f.save(f.filename)
        data_f = f.stream.seek(0)
        image1 = request.files['file'].stream.read()

        image_base64 = base64.b64encode(image1).decode()
        filename_json={"filename":f.filename}
        #image.name = image.filename
        #image = BufferedReader(image)
        print(image1)
        nft_storage_response = send_kiosk_request('/save-logo', json1=filename_json,image=image_base64)
        
    return render_template('index.html', config_data=config_data)

@app.route('/mint-token', methods=['GET', 'POST'])
def mint_token():
    print('\n==== save_logo_data() ======')
    if request.method == 'POST': 
        form_data = request.form.to_dict()        

        response = send_kiosk_request('/load-configuration')
        config_data = response.json()

        network_type = config_data['cardano']['network_type']

        cardano_networks = list(config_data['cardano']['networks'].keys())
        print(cardano_networks)

        for network in cardano_networks:
            config_data['cardano']['networks'][network]['loyalty_token']['name'] = form_data[network + '_loyalty_token_name']
            config_data['cardano']['networks'][network]['loyalty_token']['amount'] = form_data[network + '_loyalty_token_amount']

        send_kiosk_request('/save-configuration', config_data)
        
        

        response = send_kiosk_request('/mint-token')

        config_data['cardano']['networks'][network_type]['loyalty_token']['mint_url'] = response.reason

        send_kiosk_request('/save-configuration', config_data)

    return render_template('index.html', config_data=config_data)


# host='0.0.0.0' to make flask available on the local network
if __name__ == "__main__":
    #    app.run(host='0.0.0.0', port=5000)
    app.run()
