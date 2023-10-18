import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: any = null;
  activePage: any = null;
  activeId: string = 'F2Igxe9';
  titles: string[] = [];
  
  // @ViewChild('blockquoteContainer', { read: ElementRef }) blockquoteContainer!: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    const storage = this.getStorage('storage');
    if (storage) {
      this.setupData(storage);
    }
  }

  setupData(storage: any): void {
    console.log(storage);
    this.data = storage.data;
    this.titles = storage.titles;
    this.activeId = storage.activeId;
    this.activePage = storage.activePage;
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement && inputElement.files ? inputElement.files[0] : null;

    if (file) {
      this.readFileContent(file);
    }
  }

  readFileContent(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = reader.result as string;
      this.processData(fileContent);
    };

    reader.readAsText(file);
  }
  
  processData(fileContent: string) {
    // Split the input string into lines
    const lines = fileContent.split('\n');
    this.data = {};

    // Process each line
    lines.forEach((line) => {
      const parts = line.split(' - ');
      if (parts.length === 2) {
        const [key, url] = parts;
        const match = url.match(/\/([^/.]+)\.gifv$/);
        console.log(match);
        if (match) {
          const id = match[1];
          if (!this.data[key]) {
            this.data[key] = { title: key,  items: [] };
          }
          const item = {id, url};
          this.data[key].items.push(item);
        }
      }
    });

    this.titles = Object.keys(this.data);
    this.saveStorage();

    console.log('data', this.data);
  }

  setPage(page: any): void {
    this.activePage = page;
    this.saveStorage();
  }

  setItem(id: string): void {
    this.activeId = id;
    this.saveStorage();
    location.reload();
  }

  saveStorage(): void {
    this.clearStorage();

    const storage = {
      data: this.data,
      titles: this.titles,
      activePage: this.activePage,
      activeId: this.activeId,
    };

    this.setStorage('storage', storage);
  }

  getStorage(key: string) {
    const storedValue: any = localStorage.getItem(key);
    return JSON.parse(storedValue);
  }

  setStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  removeStorage(key: string) {
    localStorage.removeItem(key);
  }

  clearStorage(): void {
    // Clear all data from local storage
    localStorage.clear();
  }

  clearData(): void {
    this.clearStorage();
    this.data = null;
    this.titles = [];
    this.activePage = {};
    this.activeId = 'F2Igxe9';
  }

  // createBlockquote(activeId: string) {
  //   this.activeId = activeId;
  //   // Remove any existing blockquote elements
  //   this.removeBlockquote();

  //   // Create a new blockquote element
  //   const blockquote = this.renderer.createElement('blockquote');
  //   this.renderer.setAttribute(blockquote, 'class', 'imgur-embed-pub');
  //   this.renderer.setAttribute(blockquote, 'lang', 'en');
  //   this.renderer.setAttribute(blockquote, 'data-id', activeId);
  //   this.renderer.setAttribute(blockquote, 'data-context', 'false');
  //   const a = this.renderer.createElement('a');
  //   this.renderer.setAttribute(a, 'href', `//imgur.com/${activeId}`);
  //   this.renderer.appendChild(blockquote, a);

  //   // Append the new blockquote to the container
  //   this.renderer.appendChild(this.blockquoteContainer.nativeElement, blockquote);
  // }

  // removeBlockquote() {
  //   const container = this.blockquoteContainer.nativeElement;
  //   const blockquotes = container.querySelectorAll('blockquote');

  //   // Remove any existing blockquote elements
  //   blockquotes.forEach((blockquote: any) => {
  //     this.renderer.removeChild(container, blockquote);
  //   });
  // }
}
