export function removeClassFromElement(elementTag: string, _class: string) {
    let elems = document.getElementsByTagName(elementTag);
    for (let i = 0; i < elems.length; ++i) {
        elems[i].classList.remove(_class);
    }
}
