export function append_div(name: string, parent_id: string): Element {
    let parent = document.getElementById(parent_id);
    let new_div = document.createElement("div");
    new_div.id = name;
    if (parent) {
        parent.appendChild(new_div);
    } else {
        alert('Could not find div: ' + parent_id);
    }
    return new_div;
}

export function append_div_with_class(parent: Element, cls: string): Element {
    let new_div = document.createElement("div");
    new_div.classList.add(cls);
    parent.appendChild(new_div);
    return new_div;
}

export function get_closest_parent(elem: Element | null): Element {
    let parent: Element | null = elem;
    while (parent && !parent.classList.contains('file-data')) {
        parent = parent.parentElement;
    }
    if (!parent) {
        throw 'Could not find parent file-data element';
    }

    return parent;
}