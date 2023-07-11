const submitBtn = document.getElementById('submitBtn');
const resutl = document.getElementById('result');

submitBtn.addEventListener('click', () => {
    const mapping = document.getElementById('mappingInput').value;
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

    if (stackSize !== 0) {
        resutl.innerHTML = 'Error! Check your input and try again.'
    } else {
        resutl.innerHTML = mappingArr.join('');
    }
    document.getElementById('mappingInput').value = '';
});