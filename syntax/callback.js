const a = () => {
    console.log('A')
}

const slowfunc = (callback) => {
    callback();
}

slowfunc(a);