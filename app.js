let columnTypeMap = new Map();
let columnIndex = 0;
let columnStringArr = [];
const columnArr = [];
const typeArr = ['bool', 'datetime', 'dynamic', 'guid', 'int', 'long', 'real', 'string', 'timespan', 'decimal'];

const masterContainer = document.getElementById('container');
const container = document.getElementById('generatorContainer');
const form = document.getElementById('mappingForm');
const input = document.getElementById('mappingInput');
const resutl = document.getElementById('result');

form.addEventListener('submit', (event) => {
    const slashedMapping = slashMapping();
    printMapping(slashedMapping);
    event.preventDefault();
});

function Column(id) {
    this.id = id;
    this.parent = null;
    this.children = [];
}

function slashMapping(mappingArg) {
    const mapping = mappingArg || input.value;
    const mappingArr = [];
    let stackSize = 0;

    for (let i = 0; i < mapping.length; i++) {
        const char = mapping.charAt(i);
        if (char === '[') {
            if (stackSize === 0) {
                mappingArr.push('\\\'');
            }
            stackSize++;
        } else if (char === '"') {
            mappingArr.push('\\');
        } else if (char === '\'') {
            mappingArr.push('\\\\');
        }

        mappingArr.push(mapping.charAt(i));

        if (char === ']') {
            stackSize--;
            if (stackSize === 0) {
                mappingArr.push('\\\'');
            }
        }
    }

    input.value = '';
    if (stackSize !== 0) {
        return 'Error! Check your input and try again.';
    } else {
        return mappingArr.join('');
    }
}

function printMapping(slashedMapping) {
    resutl.textContent = slashedMapping;
}

function addColumn() {
    columnArr.push(new Column(columnIndex));
    displayGenerator(container);
    columnIndex++;
}

function displayGenerator(targetDiv) {
    const formDiv = document.createElement('div');
    formDiv.id = 'formDiv' + columnIndex;
    formDiv.style.marginLeft = '30px';

    const form = document.createElement('form');
    form.id = 'form' + columnIndex;
    form.classList.add('d-inline-flex');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Column';

    const select = document.createElement('div');
    select.classList.add('dropdown');
    const dropdownBtn = document.createElement('button');
    dropdownBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'dropdown-toggle');
    dropdownBtn.setAttribute('aria-expanded', 'false');
    dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
    dropdownBtn.setAttribute('type', 'button');
    dropdownBtn.textContent = 'type';
    dropdownBtn.style.fontStyle = 'italic';
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    for (let j = 0; j < typeArr.length; j++) {
        const dropdownItem = document.createElement('li');
        const dropdownContent = document.createElement('a');
        dropdownContent.classList.add('dropdown-item');
        dropdownContent.text = typeArr[j];
        dropdownItem.addEventListener('click', () => {
            dropdownBtn.style.fontStyle = 'normal';
            dropdownBtn.textContent = dropdownContent.text;
        });
        dropdownItem.appendChild(dropdownContent);
        dropdownMenu.appendChild(dropdownItem);
    }
    select.appendChild(dropdownBtn);
    select.appendChild(dropdownMenu);
    
    const addSubColumnBtn = document.createElement('button');
    addSubColumnBtn.id = columnIndex;
    addSubColumnBtn.textContent = 'Add subcolumn';
    addSubColumnBtn.classList.add('btn', 'btn-primary', 'btn-sm');
    addSubColumnBtn.setAttribute('type', 'button');
    addSubColumnBtn.addEventListener('click', () => {
        const formDiv = document.getElementById('formDiv' + addSubColumnBtn.id);
        const newColumn = new Column(columnIndex);
        let i = 0;
        for (const column of columnArr) {
            if (column.id == addSubColumnBtn.id) {
                newColumn.parent = column;
                column.children.push(newColumn);
                break;
            }
            i++;
        }
        columnArr.splice(i++, 0, newColumn);
        displayGenerator(formDiv);
        columnIndex++;
        dropdownBtn.style.fontStyle = 'normal';
        dropdownBtn.textContent = 'custom';
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.id = columnIndex;
    deleteBtn.textContent = '⨉';
    deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.title = 'Experimental';
    deleteBtn.addEventListener('click', () => {
        const formDiv = document.getElementById('formDiv' + deleteBtn.id);
        formDiv.parentNode.removeChild(formDiv);
        let parentId;
        for (const column of columnArr) {
            if (column.id == deleteBtn.id) {
                if (column.parent == null) {
                    return;
                }
                parentId = column.parent.id;
            }
        }
        for (const column of columnArr) {
            if (column.id == parentId) {
                for (let i = 0; i < column.children.length; i++) {
                    if (column.children[i].id == deleteBtn.id) {
                        column.children.splice(i, 1);
                        break;
                    }
                }
            }
        }
    });

    form.appendChild(input);
    form.appendChild(select);
    form.appendChild(addSubColumnBtn);
    form.appendChild(deleteBtn);
    formDiv.appendChild(form);
    targetDiv.appendChild(formDiv);
}

function generateConfig() {
    columnStringArr = [];
    let config = '';
    const tableConfig = document.getElementById('tableConfig');
    const tableNameInput = document.querySelector('input');
    if (tableNameInput.value === '') {
        tableConfig.style.color = '#dc3545';
        tableConfig.textContent = 'Error! Specify table name.'
        return;
    }
    for (const column of columnArr) {
        if (column.children.length === 0) {
            let parentPath = '';
            let type = '';
            let tempColumn = column;
            while (tempColumn != null) {
                try {
                    const form = document.getElementById('form' + tempColumn.id);
                    const input = form.querySelector('input');
                    const dropdown = form.querySelector('div.dropdown');
                    const dropdownBtn = dropdown.querySelector('button');
                    if (dropdownBtn.textContent === 'type' || input.value === '') {
                        tableConfig.style.color = '#dc3545';
                        tableConfig.textContent = 'Error! All columns must have specified name and type.'
                        return;
                    }
                    if (type === '') {
                        type = dropdownBtn.textContent;
                    }
                    parentPath = input.value + '_' + parentPath;
                    tempColumn = tempColumn.parent;
                } catch (error) {
                    parentPath = '';
                    break;
                }
            }
            if (parentPath !== '') {
                config += parentPath.slice(0, -1) + ': ' + type + ', ';
                columnStringArr.push(parentPath.slice(0, -1));
            }
        }
    }
    if (config === '') {
        tableConfig.style.color = '#dc3545';
        tableConfig.textContent = 'Error! Add at least one column.';
        return;
    }
    addEnhancedColumns();
    printConfig(config, tableNameInput.value);
}

function addEnhancedColumns() {
    const enhancmentColumns = ['_eventType', '_kafkaTopic', '_kafkaPartition', '_kafkaOffset', '_kafkaTimestamp', '_schema', '_eventTime', '_indexTime', '_aggregateId', '_correlationId'];
    const enhancementTypes = ['string', 'string', 'int', 'int', 'long', 'string', 'datetime', 'long', 'string', 'string'];
    for (let i = 0; i < enhancmentColumns.length; i++) {
        columnStringArr.push(enhancmentColumns[i]);
        columnTypeMap.set(enhancmentColumns[i], enhancementTypes[i]);
    }
}

function printConfig(config, tableName) {
    columnTypeMap.forEach((value, key) => {
        config += key + ': ' + value + ', ';
    });

    let mappingScript = '[';
    for (const column of columnStringArr) {
        let pathString = '$';
        if (column[0] === '_') {
            let tempColumn = '@' + column.slice(1);
            pathString += '[\'' + tempColumn +'\']'
        } else {
            let path = column.split('_');
            for (const word of path) {
                pathString += '[\'' + word +'\']'
            }
        }
        mappingScript += 
        '{' +
            '"column":"' + column + '",' +
            '"path":"' + pathString + '",' +
            '"datatype": "",' +
            '"transform": null' +
        '},';
    }
    mappingScript = mappingScript.slice(0, -1) + ']';
    const slashedMappingScript = slashMapping(mappingScript);

    const tableConfig = document.getElementById('tableConfig');
    tableConfig.style.color = '#dee2e6';
    tableConfig.innerHTML = 
    '<pre style="margin-bottom: 0px;">' +
    '{<br>' +    
    '    id: \'\',<br>' +
    '    script: \'.create table ' + tableName + ' (' + config.slice(0, -2) + ')\',<br>' +
    '    author: \'\',<br>' +
    '    comment: \'\',<br>' +
    '    env: \'\'<br>' +
    '},<br>' +
    '<br>' +
    '{<br>' +
    '    id: \'\',<br>' +
    '    script: \'.create table ' + tableName + ' ingestion json mapping \\"' + tableName + '_mapping\\" ' + slashedMappingScript + '\',<br>' +
    '    author: \'\',<br>' +
    '    comment: \'\',<br>' +
    '    env: \'\'<br>' +
    '}<br>' +
    '</pre>';
    
}

function init() {
    const form = document.createElement('form');
    form.classList.add('d-inline-flex');
    form.addEventListener('submit', (event) => {
        generateConfig();
        event.preventDefault();
    });
    const tableNameInput = document.createElement('input');
    tableNameInput.type = 'text';
    tableNameInput.placeholder = 'Table name';

    const addColumnBtn = document.createElement('button');
    addColumnBtn.textContent = 'Add column';
    addColumnBtn.classList.add('btn', 'btn-primary', 'btn-sm');
    addColumnBtn.setAttribute('type', 'button');
    addColumnBtn.addEventListener('click', addColumn);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.classList.add('btn', 'btn-success', 'btn-sm');
    submitBtn.setAttribute('type', 'button');
    submitBtn.addEventListener('click', generateConfig);

    form.appendChild(tableNameInput);
    form.appendChild(addColumnBtn);
    form.appendChild(submitBtn);
    container.appendChild(form);
}

init();
