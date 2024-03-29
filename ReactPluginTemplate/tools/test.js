process.stdin.on('data', function(data) {
    const input = data.toString().trim();
    console.log('You entered:', input);
    if (input === 'quit') {
        process.exit();
    }
});

console.log('Type something and press Enter. Type "quit" to exit.');