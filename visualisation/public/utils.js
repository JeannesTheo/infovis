export function lightenDarkenColor(col,amt) {
    if (col[0]==="#") {
        col = col.slice(1);
    }

    let num = parseInt(col,16);
    let f=function(n) { return n>255?255:(Math.max(0,n)) }
    let h=function(n) { return n.length<2?"0"+n:n }

    let r = h(f((num >> 16) + amt).toString(16));
    let b = h(f(((num >> 8) & 0x00FF) + amt).toString(16));
    let g = h(f((num & 0x0000FF) + amt).toString(16));

    return "#" + r + b + g;
}

export function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

export function getHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}