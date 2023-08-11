export class Menu {
  el: HTMLElement;
  constructor(selector: string) {
    this.el = document.querySelector(selector);
  }

  show() {
    this.el.classList.add("active");
  }
  hide() {
    this.el.classList.remove("active");
  }
  addOnClick(sel: string, cb: (e: Event) => void) {
    this.el.querySelector(sel).addEventListener("click", cb);
  }
}
