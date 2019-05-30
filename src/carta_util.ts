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