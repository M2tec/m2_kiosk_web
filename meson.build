project('m2-kiosk-web',
        version: '0.0.1')

install_subdir('CalculatorJS-Section-main', install_dir: 'var/www/m2-kiosk-web')
install_subdir('static', install_dir: 'var/www/m2-kiosk-web')
install_subdir('templates', install_dir: 'var/www/m2-kiosk-web')


install_data('m2_kiosk_web_config.json', install_dir: 'var/www/m2-kiosk-web')
install_data('main.py', install_dir: 'var/www/m2-kiosk-web')
install_data('wsgi.py', install_dir: 'var/www/m2-kiosk-web')
install_data('main.py', install_dir: 'var/www/m2-kiosk-web')
install_data('config_template.json', install_dir: 'var/www/m2-kiosk-web')

install_data('systemd/m2paypad.service', install_dir: 'lib/systemd/system')
install_subdir('etc', install_dir: '')

install_subdir('DEBIAN', install_dir: '')

