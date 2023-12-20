import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: any = null;
  activePage: any = null;
  activeId: string = '';
  activeType: string = '';
  titles: string[] = [];

  constructor(private sanitizer: DomSanitizer) { }

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
    this.activeType = storage.activeType;
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

        const isGyfcat = url.includes('gfycat.com');
        const isImgur = url.includes('imgur.com');
        const isImgurGif = url.includes('i.imgur.com');
        const isPixel = url.includes('pixeldrain.com');

        let id: string = '';
        let type: string = '';
        
        if (isPixel) {
          id = this.getPixelId(url);
          type = 'pixel';
        }

        if (isGyfcat) {
          id = this.getGyfcatId(url);
          type = 'gyfcat';
        }

        if (isImgur && !isImgurGif) {
          id = this.getImgurId(url);
          type = 'imgur';
        }

        if (isImgur && isImgurGif) {
          id = this.getImgurGifId(url);
          type = 'imgur';
        }

        if (id && type) {
          if (!this.data[key]) {
            this.data[key] = { title: key,  imgur: [], gyfcat: [], pixel: [] };
          }
          const item = {id, url, type};
          this.data[key][type].push(item);
        }
      }
    });

    this.titles = Object.keys(this.data);
    this.saveStorage();

    console.log('data', this.data);
  }

  getPixelId(url: string): string {
    const regex = /\/([^/]+)$/;
    const match = regex.exec(url);
    return match ? match[1] : '';
  }

  getPixelLink(id: string): any {
    const url = 'https://pixeldrain.com/api/file/' + id;
    const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return safeUrl;
  }

  getGyfcatId(url: string): string {
    const match = url.match(/gfycat\.com\/([^/]+)/);
    if (match) {
      return match[1];
    }
    return '';
  }

  getGyfcatLink(id: string): any {
    const url = 'https://web.archive.org/web/20230819113342if_/https://gfycat.com/' + id;
    const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return safeUrl;
  }

  getImgurId(url: string): string {
    const match = url.match(/imgur\.com\/([^/.]+)/);
    if (match) {
      return match[1];
    }
    return '';
  }
  
  getImgurGifId(url: string): string {
    const match = url.match(/i.imgur\.com\/([^/.]+)\.gifv/);
    if (match) {
      return match[1];
    }
    return '';
  }

  setPage(page: any): void {
    this.activePage = page;
    this.saveStorage();
  }

  setItem(id: string, type: string): void {
    this.activeId = id;
    this.activeType = type;
    this.saveStorage();
    if (type === 'imgur') {
      location.reload();
    }
  }

  saveStorage(): void {
    this.clearStorage();

    const storage = {
      data: this.data,
      titles: this.titles,
      activePage: this.activePage,
      activeId: this.activeId,
      activeType: this.activeType,
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
    this.activeId = '';
    this.activeType = '';
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
