import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivityService } from '../../activity.service';
import { SearchService, SearchResult } from '../../search.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  notificationCount = 0;
  searchTerm = '';
  searchResults$!: Observable<SearchResult[]>;   // ✅ observable بدل array
  showSearchResults = false;
  isSearchFocused = false;
  showTypingIndicator = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchResultsContainer') searchResultsContainer!: ElementRef;

  constructor(
    private activityService: ActivityService,
    private searchService: SearchService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.notificationCount = this.activityService.getNotificationCount();
    this.activityService.notificationCount$.subscribe((count) => {
      this.notificationCount = count;
    });

    // ✅ default: رجع كل الصفحات
    this.searchResults$ = this.searchService.search('');
  }

  clearNotifications(): void {
    this.activityService.clearNotifications();
  }

  onSearchChange(): void {
    this.showTypingIndicator = true;

    setTimeout(() => {
      this.searchResults$ = this.searchService.search(this.searchTerm);
      this.showSearchResults = this.isSearchFocused;
      this.showTypingIndicator = false;
    }, 300);
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
    this.searchResults$ = this.searchService.search(this.searchTerm);
    this.showSearchResults = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      if (!this.isMouseOverResults()) {
        this.isSearchFocused = false;
        this.showSearchResults = false;
      }
    }, 200);
  }

  isMouseOverResults(): boolean {
    return this.searchResultsContainer?.nativeElement?.matches(':hover') || false;
  }

  selectResult(result: SearchResult): void {
    this.searchService.navigateToResult(result);
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults$ = of([]);   // ✅ فرغ النتائج
    this.showSearchResults = false;
    this.isSearchFocused = false;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (
      this.showSearchResults &&
      !this.searchInput.nativeElement.contains(event.target) &&
      !this.searchResultsContainer.nativeElement.contains(event.target)
    ) {
      this.showSearchResults = false;
      this.isSearchFocused = false;
    }
  }
}
