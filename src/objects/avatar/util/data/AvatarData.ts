export class AvatarData {
  protected document: Document;

  constructor(xml: string) {
    this.document = new DOMParser().parseFromString(xml, "text/xml");
  }

  protected querySelectorAll(query: string) {
    return Array.from(this.document.querySelectorAll(query));
  }

  protected querySelector(query: string) {
    return this.document.querySelector(query);
  }
}
