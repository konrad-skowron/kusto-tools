function slashMapping(event) {
    const mapping = input.value;
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
        resutl.textContent  = 'Error! Check your input and try again.'
    } else {
        resutl.textContent  = mappingArr.join('');
    }
    event.preventDefault(); // prevent page reload on form submit
}

const form = document.getElementById('mappingForm');
const input = document.getElementById('mappingInput');
const resutl = document.getElementById('result');
form.addEventListener("submit", slashMapping);
