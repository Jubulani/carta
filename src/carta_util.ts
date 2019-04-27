export function add_div(name: string, parent_id: string) {
    let parent = document.getElementById(parent_id);
    let div = document.createElement("div");
    div.id = name;
    if (parent) {
        parent.appendChild(div);
    } else {
        alert('Could not find div: ' + parent_id);
    }
}