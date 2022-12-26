

const unescaped = /[-/\\^$*+?.()|[\]{}]/g;

const escaped = '\\$&';


function escapeRegExp ( string = '' ){
    return string
        .replace(unescaped,escaped)
}


module.exports = escapeRegExp;
