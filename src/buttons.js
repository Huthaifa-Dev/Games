import { ICONS } from "./constants";
// const ICONS = ["fish", "poop", "weather"];
const toggleHighlighted = (icon, show) =>
    document
        .querySelector(`.${ICONS[icon]}-icon`)
        .classList.toggle("highlighted", show);

//toggleHighlighted('poop', false)

export default function initButtons(handleUserAction) {
    let selectedIcon = 0;

    function buttonClick({ target }) {
        if (target.classList.contains("left-btn")) {
            toggleHighlighted(selectedIcon, false);
            selectedIcon = (2 + selectedIcon) % ICONS.length;
            toggleHighlighted(selectedIcon, true);
        } else if (target.classList.contains("right-btn")) {
            toggleHighlighted(selectedIcon, false);
            selectedIcon = (1 + selectedIcon) % ICONS.length;
            toggleHighlighted(selectedIcon, true);
        } else {
            handleUserAction(ICONS[selectedIcon]);
        }
    }

    document.querySelector(".buttons").addEventListener("click", buttonClick);
}
