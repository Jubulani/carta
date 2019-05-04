export function add_div_before(name: string, parent_id: string, before_id: string): Element {
    let parent = document.getElementById(parent_id);
    let before = document.getElementById(before_id);
    let new_div = document.createElement("div");
    new_div.id = name;
    if (parent) {
        parent.insertBefore(new_div, before);
    } else {
        alert('Could not find div: ' + parent_id);
    }
    return new_div;
}