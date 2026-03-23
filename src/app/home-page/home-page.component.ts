import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Site } from '../core/shared/site.model';
import { environment } from '../../environments/environment';
import { HostWindowService } from '../shared/host-window.service';
@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {

  site$: Observable<Site>;
  recentSubmissionspageSize: number;
  isXsOrSm$: Observable<boolean>;
  visible: boolean = true;
  constructor(
    private route: ActivatedRoute,
    protected windowService: HostWindowService,
  ) {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
    this.recentSubmissionspageSize = environment.homePage.recentSubmissions.pageSize;
  }

  /**
   * Set the sidebar to a collapsed state
   */
  public closeSidebar(): void {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    this.site$ = this.route.data.pipe(
      map((data) => data.site as Site),
    );
  }
}
