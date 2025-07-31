
const emergencyStop = document.getElementById('bt-emergency');
const btReset = document.getElementById('bt-reset');


// Estados atuais das bobinas
let valueStop = false;
let valueReset = false;
let valueLight = false;
let valueItemReady = false;
let valueAtEntry = false;
let valueAtExit = false;
let valueEntryConveyor = false;
let valueBufferConveyor = false;

// Estado atual do registro
let valueCounter = 0;

// Adicionar variáveis para controle de requisições
let isReadingCoils = false;
let isReadingRegister = false;
let coilsIntervalId = null;
let registerIntervalId = null;

// Função para atualizar a interface baseada no estado das bobinas e dos registros
function updateInterface() {
    const statusStop = document.getElementById('status-stop');
    const statusReset = document.getElementById('reset-light');
    const statusItemReady = document.getElementById('st-item-ready');
    const statusAtEntry = document.getElementById('st-at-entry');
    const statusAtExit = document.getElementById('st-at-exit');
    const statusEntryConveyor = document.getElementById('entry-value');
    const statusBufferConveyor = document.getElementById('buffer-value');
    const statusCounter = document.getElementById('counter');
    
    // Atualizar botão e status de EMERGENCIA
    if (valueStop === false) {
        emergencyStop.textContent = 'STOP';
        emergencyStop.style.backgroundColor = 'rgb(255, 50, 32)';
        emergencyStop.style.color = '#fff';
        statusStop.textContent = 'EMERGENCY TRIGGERED'
        statusStop.style.color = 'rgb(255, 50, 32)';
    } else {
        emergencyStop.textContent = 'EMERGENCY';
        emergencyStop.style.backgroundColor = 'transparent';
        emergencyStop.style.color = 'rgb(255, 50, 32)';
        statusStop.textContent = '';
    }
    
    // Atualizar botão e status do RESET
    if (valueLight) {
        statusReset.textContent = 'NEEDS TO RESET';
        statusReset.style.color = 'blue';
    } else {
        statusReset.textContent = '';
    }
    
    // Atualizar status dos SENSORES
    if (valueItemReady) {
        statusItemReady.style.backgroundColor = 'green';
    } else {
        statusItemReady.style.backgroundColor = 'gray';
    }

    if (valueAtEntry) {
        statusAtEntry.style.backgroundColor = 'green';
    } else {
        statusAtEntry.style.backgroundColor = 'gray';
    }

    if (valueAtExit) {
        statusAtExit.style.backgroundColor = 'green';
    } else {
        statusAtExit.style.backgroundColor = 'gray';
    }

    // Atualiza status dos MOTORES
    if (valueEntryConveyor) {
        statusEntryConveyor.style.backgroundColor = 'green';
    } else {
        statusEntryConveyor.style.backgroundColor = 'gray';
    }

    if (valueBufferConveyor) {
        statusBufferConveyor.style.backgroundColor = 'green';
    } else {
        statusBufferConveyor.style.backgroundColor = 'gray';
    }
    
    // Atualizar contador
    if (statusCounter) {
        statusCounter.textContent = `${valueCounter}`;
        statusCounter.style.color = 'rgb(255, 50, 32)';
    }
}

// Função para ler o estado das bobinas do servidor
async function readCoils() {
    // Prevenir requisições concorrentes
    if (isReadingCoils) {
        console.log('Requisição de bobinas já em andamento, aguardando...');
        return;
    }
    
    isReadingCoils = true;
    try {
        const response = await fetch('http://localhost:3000/read_coil');
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        
        const data = await response.json();
        if (data.success) {
            valueStop = data.emergencyStop;
            valueReset = data.resetButton;
            valueLight = data.resetLight;
            valueItemReady = data.itemReady;
            valueAtEntry = data.atEntry;
            valueAtExit = data.atExit;
            valueEntryConveyor = data.entryConveyor;
            valueBufferConveyor = data.bufferConveyor;
            updateInterface();
            console.log('Estado das bobinas atualizado:', data);
        } else {
            console.error('Erro do servidor:', data.error);
            alert('Erro ao ler bobinas: ' + data.error);
        }
    } catch (error) {
        console.error('Erro ao ler bobinas:', error);
    } finally {
        isReadingCoils = false;
    }
}

// Funçção para ler os registros do servidor
async function readRegister() {
    // Prevenir requisições concorrentes
    if (isReadingRegister) {
        console.log('Requisição de registro já em andamento, aguardando...');
        return;
    }
    
    isReadingRegister = true;
    try {
        const response = await fetch('http://localhost:3000/read_register');
        if (!response.ok) {
            throw new Error('Erro na requisição:' + response.status);
        }

        const data = await response.json();
        if (data.success) {
            valueCounter = data.value;
            updateInterface();
            console.log('Registro atualizado:', data);
        } else {
            console.error('Erro do servidor:', data.error);
            alert('Erro ao ler registro: ' + data.error);
        }
    } catch (error) {
        console.error('Erro ao ler registro:', error);
    } finally {
        isReadingRegister = false;
    }
}

// Função para escrever em uma bobina específica
async function writeCoil(address, value) {
    try {
        const response = await fetch('http://localhost:3000/write_coil', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: address,
                value: value
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log(`Bobina ${address} alterada para ${value}`);
            // Atualizar o estado local e a interface
            if (address === 3) {
                valueStop = value;
            } else if (address === 4) {
                valueReset = value;
            }
            updateInterface();
        } else {
            console.error('Erro ao escrever bobina:', data.error);
            alert('Erro ao escrever bobina: ' + data.error);
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao escrever bobina:', error);
        alert('Erro de comunicação: ' + error.message);
        return { success: false, error: error.message };
    }
}

// Função para alternar o estado da EMERGENCIA
async function toggleActive() {
    const newValue = !valueStop;
    await writeCoil(3, newValue);
}

// Função para alternar o estado do RESET
async function toggleAlert() {
    const newValue = !valueReset;
    await writeCoil(4, newValue);
}

// Event listeners
emergencyStop.addEventListener('click', toggleActive);
btReset.addEventListener('click', toggleAlert);

// Função para inicializar os intervalos
function startPeriodicUpdates() {
    // Limpar intervalos existentes para evitar duplicação
    if (coilsIntervalId) {
        clearInterval(coilsIntervalId);
    }
    if (registerIntervalId) {
        clearInterval(registerIntervalId);
    }
    
    // Carregar estado inicial
    readCoils();
    readRegister();
    
    // Configurar novos intervalos com tempo um pouco maior para dar mais margem
    coilsIntervalId = setInterval(readCoils, 1000);  // Aumentar para 2 segundos
    registerIntervalId = setInterval(readRegister, 2000);  // Aumentar para 2 segundos
}

// Função para parar os intervalos
function stopPeriodicUpdates() {
    if (coilsIntervalId) {
        clearInterval(coilsIntervalId);
        coilsIntervalId = null;
    }
    if (registerIntervalId) {
        clearInterval(registerIntervalId);
        registerIntervalId = null;
    }
}

// Carregar estado inicial quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    startPeriodicUpdates();
});

// Parar intervalos quando a página é descarregada
window.addEventListener('beforeunload', function() {
    stopPeriodicUpdates();
});

// Remover código duplicado de inicialização
// Se o DOM já estiver carregado, inicializar imediatamente
if (document.readyState !== 'loading') {
    startPeriodicUpdates();
}