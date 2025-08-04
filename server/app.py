from flask import Flask, jsonify, request
from pymodbus.client import ModbusTcpClient
from flask_cors import CORS
import logging


# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configurações do cliente Modbus
HOST = '192.168.1.5'  # Endereço IP do servidor Modbus
PORT = 502  # Porta padrão do Modbus TCP
UNIT = 1  # Endereço do escravo Modbus

# Criar uma única instância do cliente Modbus
client = ModbusTcpClient(
    host=HOST,
    port=PORT,
    timeout=10,
    retries=4
)

@app.route('/status', methods=['GET'])
def get_modbus_status():
    """Endpoint para verificar o status da conexão Modbus"""
    return jsonify({
        'connected': client.connected,
        'host': HOST,
        'port': PORT
    })

@app.route('/read_coil', methods=['GET'])
def read_coil():
    """Endpoint para ler o estado de uma bobina"""
    try:
        if not client.connected:
            client.connect()
            
        # Lê uma bobina (coil)
        emergency_stop = client.read_coils(address=4, count=1, slave=UNIT)
        emergency_stop_value = emergency_stop.bits[0]

        reset_button = client.read_coils(address=3, count=1, slave=UNIT)
        reset_button_value = reset_button.bits[0]

        item_ready = client.read_coils(address=2, count=1, slave=UNIT)
        item_ready_value = item_ready.bits[0]

        at_entry = client.read_coils(address=0, count=1, slave=UNIT)
        at_entry_value = at_entry.bits[0]

        at_exit = client.read_coils(address=1, count=1, slave=UNIT)
        at_exit_value = at_exit.bits[0]

        entry_conveyor = client.read_coils(address=6, count=1, slave=UNIT)
        entry_conveyor_value = entry_conveyor.bits[0]

        buffer_conveyor = client.read_coils(address=7, count=1, slave=UNIT)
        buffer_conveyor_value = buffer_conveyor.bits[0]

        reset_light = client.read_coils(address=5, count=1, slave=UNIT)
        reset_light_value = reset_light.bits[0]

        return jsonify({
            'success': True,
            'emergencyStop': emergency_stop_value,
            'resetButton': reset_button_value,
            'itemReady': item_ready_value,
            'atEntry': at_entry_value,
            'atExit': at_exit_value,
            'entryConveyor': entry_conveyor_value,
            'bufferConveyor': buffer_conveyor_value,
            'resetLight': reset_light_value
        })

    except Exception as e:
        logger.error(f"Exceção ao ler bobina: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/write_coil', methods=['POST'])
def write_coil():
    """Endpoint para escrever em uma bobina"""
    data = request.json
    
    # Validate data type
    if not data or not isinstance(data, dict):
        return jsonify({
            'success': False,
            'error': 'Invalid JSON data. Expected object with address and value'
        }), 400
    
    # Validate required fields
    if 'address' not in data or 'value' not in data:
        return jsonify({
            'success': False,
            'error': 'Missing required parameters: address and value'
        }), 400
        
    address = data['address']
    value = data['value']
    
    try:
        if not client.connected:
            client.connect()
            
        client.write_coil(address=address, value=value, slave=UNIT)
        
        return jsonify({
            'success': True,
            'address': address,
            'value': value
        })
        
    except Exception as e:
        logger.error(f"Exceção ao escrever bobina: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/read_register', methods=['GET'])
def read_register():
    """Endpoint para ler um registro"""
    try:
        if not client.connected:
            client.connect()
            
        # Lê um registro de retenção
        counter = client.read_holding_registers(address=0, count=1, slave=UNIT)

        if not counter.isError():
            valor = counter.registers[0]
            return jsonify({
                'success': True,
                'value': valor,
                'address': 0
            })
        else:
            logger.error(f"Erro ao ler registro: {counter}")
            return jsonify({
                'success': False,
                'error': 'Erro ao ler o registro',
                'details': str(counter)
            }), 400

    except Exception as e:
        logger.error(f"Exceção ao ler registro: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    try:
        # Tentar conectar ao iniciar a aplicação
        if client.connect():
            logger.info("Conectado ao servidor Modbus com sucesso!")
        else:
            logger.warning("Não foi possível conectar ao servidor Modbus!")
            
        app.run(debug=True, host='0.0.0.0', port=3000)
    finally:
        # Garantir que o cliente seja fechado adequadamente
        client.close()