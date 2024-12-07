const terminal = require('terminal-kit').terminal;

const message = async (msg, color, clear=true) => {
    if (clear) terminal.clear()
    const fn = color ? terminal[color]: terminal 
    fn(`\n${msg}\n`)
}
const defaultFieldsFileter = () => true
const promptFields = async (fields=["Name", "Alignment"], fieldsFilter=defaultFieldsFileter) => {
    terminal.grabInput(true);
    const response = {}
    for (const field of fields) {
        if (!fieldsFilter(field, response)) continue
        terminal.bold.cyan(`${field}: `);
        const val = await terminal.inputField({
            echo: true,
        }).promise
        console.log()

        response[field] = val
    }
    terminal.grabInput(false);
    return response;
};

const promptAccept = async (msg, noFirst) => {
    terminal.bold.green(`\n${msg}\n`)
    const options = ['Yes', 'No']
    const addAnother = await terminal.singleColumnMenu(noFirst ? options.reverse(): options).promise;
    return addAnother.selectedText === 'Yes';
};
const getChoice = async (choices, msg) => {
    if (msg) message(`\n${msg}\n`, "cyan")
    else console.log()

    return (await terminal.singleColumnMenu(choices).promise).selectedText;
}

module.exports = {
    getChoice, promptAccept, message, promptFields
}