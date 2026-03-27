import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { trigger, transition, animate, style } from "@angular/animations";
import { ActivatedRoute, Router, Data } from '@angular/router';
import { hasValue, isNotEmpty } from '../empty.util';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload } from '../../core/shared/operators';
import { Bitstream } from '../../core/shared/bitstream.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { AuthService } from '../../core/auth/auth.service';
import { BehaviorSubject, combineLatest as observableCombineLatest, Observable, of as observableOf } from 'rxjs';
import { FileService } from '../../core/shared/file.service';
import { HardRedirectService } from '../../core/services/hard-redirect.service';
import { getForbiddenRoute } from '../../app-routing-paths';
import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { ItemDataService } from '../../core/data/item-data.service';

import { ITEM_PAGE_LINKS_TO_FOLLOW } from '../../item-page/item.resolver';

import { followLink } from '../../shared/utils/follow-link-config.model';

import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { URLCombiner } from '../../core/url-combiner/url-combiner';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'ds-display-bitstream',
  templateUrl: './display-bitstream.component.html',
  styleUrls: ['./display-bitstream.component.scss'],
  animations: [
    trigger("slideInOut", [
      transition(":enter", [
        style({ transform: "translateX(-100%)" }),
        animate("200ms ease-in", style({ transform: "translateX(0%)" })),
      ]),
    ]),
    trigger("slideOutIn", [
      transition(":enter", [
        style({ transform: "translateX(100%)" }),
        animate("200ms ease-in", style({ transform: "translateX(0)" })),
      ]),
    ]),
  ],
})
export class DisplayBitstreamComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfViewer') public pdfViewer;
  itemRD$: BehaviorSubject<RemoteData<Item>>;
  itemTab: Item;
  @Input() isBlank: Boolean = false;

  /**
   * The ID of the item the bitstream originates from
   * Taken from the current query parameters when present
   * This will determine the route of the item edit page to return to
   */
  bitstreams$: BehaviorSubject<Bitstream[]>;
  itemid: string;
  bitstreamRD$: Observable<RemoteData<Bitstream>>;
  bistremobj: Bitstream;
  filepath: any="";
  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private auth: AuthService,
    
    private fileService: FileService,
    private hardRedirectService: HardRedirectService,
    private itemService: ItemDataService,
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    private cdRef: ChangeDetectorRef,
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;



  }
  ngAfterViewInit() {
   this.callme()
  }
  public callme(): void {
    debugger;
    this.route.data.subscribe((data: Data) => {
     // console.log("BISTREMA>>>>>>>>>,", data)
      //this.bistremobj = null;
      this.bistremobj = data.bitstream.payload;
    //  console.log("this.bistremobj....",this.bistremobj)
      this.auth.getShortlivedToken().pipe(take(1), map((token) =>
        hasValue(token) ? new URLCombiner(decodeURI(this.bistremobj._links.content.href), `?authentication-token=${token}`).toString() : decodeURI(this.bistremobj._links.content.href))).subscribe((logs: string) => {
          //console.log(logs)
          console.log(logs)
          this.pdfViewer.pdfSrc= encodeURIComponent(logs);
          this.pdfViewer.refresh(); // Ask pdf viewer to load/refresh pdf
          this.cdRef.detectChanges();
          //window.open("/assets/pdfjs/web/viewer.html?file=" + encodeURIComponent(logs), "_self")
        });

      // this.pdfViewer.pdfSrc = this.bistremobj._links.content.href; // pdfSrc can be Blob or Uint8Array
     

    })

  }
  ngOnInit(): void {
    window.oncontextmenu = function () {
      return false;
    }
    this.route.queryParams.subscribe((params) => {
      if (hasValue(params.itemid)) {
        this.itemid = params.itemid;
       // console.log(this.itemid)

        const itemRD$ = this.itemService.findById(this.itemid,
          true,
          false, ...ITEM_PAGE_LINKS_TO_FOLLOW
        ).pipe(
          getFirstCompletedRemoteData(),
        );

        itemRD$.subscribe((itemRD: RemoteData<Item>) => {
          this.itemTab = itemRD.payload;
          this.cdRef.detectChanges();
        });
      }
    })

   // this.callme();
    //   this.router.routeReuseStrategy.shouldReuseRoute = function() {
    //     return false;
    // };





  }
  clickHandler(event: any) {
    console.log(event.node.data.id)
  }

}
